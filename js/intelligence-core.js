/* ==========================================================
   GrowWithHR
   Intelligence Core

   Self-contained Canvas 2D renderer for the homepage Company
   DNA graph. This module has no third-party or CDN dependency.
========================================================== */

(() => {
    "use strict";

    const container = document.getElementById("dnaCoreCanvas");

    window.GWHR_LOG?.("[GrowWithHR:LAYOUT]", {
        component: "intelligence-core",
        initialized: Boolean(container),
        renderer: "canvas-2d"
    });

    if (!container) {
        return;
    }

    window.GrowWithHRIntelligenceCore?.destroy?.();

    const NODES = Object.freeze([
        { id: "growth", label: "Growth" },
        { id: "leadership", label: "Leadership" },
        { id: "organization", label: "Organization" },
        { id: "workforce", label: "Workforce" },
        { id: "learning", label: "Learning" },
        { id: "compliance", label: "Compliance" },
        { id: "customer", label: "Customer Success" },
        { id: "rewards", label: "Rewards" },
        { id: "performance", label: "Performance" },
        { id: "culture", label: "Culture" }
    ]);

    const PILLARS = Object.freeze({
        company: Object.freeze([0, 1, 2]),
        people: Object.freeze([3, 4]),
        operations: Object.freeze([5, 7]),
        growth: Object.freeze([6, 8, 9])
    });

    const STAGES = Object.freeze({
        startup: { orbit: 0.92, speed: 0.82 },
        growth: { orbit: 0.98, speed: 1 },
        scaling: { orbit: 1.03, speed: 1.16 },
        enterprise: { orbit: 1.08, speed: 1.28 }
    });

    const RECOMMENDATIONS = Object.freeze({
        company: { active: "#ffb347", secondary: "#63b3ff" },
        stage: { active: "#ffd27a", secondary: "#7dd3fc" },
        laws: { active: "#ff9f43", secondary: "#60a5fa" },
        updates: { active: "#fbbf24", secondary: "#93c5fd" }
    });

    const state = {
        pillar: "company",
        stage: "startup",
        recommendation: "company",
        width: 0,
        height: 0,
        pixelRatio: 1,
        elapsed: 0,
        lastTimestamp: 0,
        running: false,
        visible: true,
        destroyed: false,
        animationFrame: 0,
        resizeFrame: 0
    };

    const motionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );
    let reducedMotion = motionQuery.matches;

    if (getComputedStyle(container).position === "static") {
        container.style.position = "relative";
    }

    container.style.overflow = "visible";
    container.dataset.renderer = "canvas-2d";
    container.dataset.ready = "false";
    container.removeAttribute("data-error");

    container
        .querySelectorAll("canvas[data-growwithhr-intelligence-core]")
        .forEach((element) => element.remove());
    container.querySelector("#dnaLabels")?.remove();

    const canvas = document.createElement("canvas");
    canvas.dataset.growwithhrIntelligenceCore = "true";
    canvas.className = "dna-core-canvas";
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
        position: "absolute",
        inset: "0",
        display: "block",
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        pointerEvents: "none"
    });

    const context = canvas.getContext("2d", {
        alpha: true,
        desynchronized: true
    });

    if (!context) {
        container.dataset.error = "canvas-context-unavailable";
        return;
    }

    const labelLayer = document.createElement("div");
    labelLayer.id = "dnaLabels";
    labelLayer.setAttribute("aria-hidden", "true");
    Object.assign(labelLayer.style, {
        position: "absolute",
        inset: "0",
        zIndex: "2",
        overflow: "visible",
        pointerEvents: "none"
    });

    const labels = NODES.map((node) => {
        const label = document.createElement("div");
        label.className = "dna-label";
        label.dataset.node = node.id;
        label.textContent = node.label;
        Object.assign(label.style, {
            position: "absolute",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            willChange: "left, top, transform"
        });
        labelLayer.appendChild(label);
        return label;
    });

    container.append(canvas, labelLayer);

    const positions = NODES.map(() => ({ x: 0, y: 0 }));
    const links = [];

    for (let start = 0; start < NODES.length; start += 1) {
        for (let end = start + 1; end < NODES.length; end += 1) {
            links.push({
                start,
                end,
                offset: (((start + 1) * 17 + (end + 1) * 29) % 100) / 100,
                speed: 0.07 + (((start + 1) * 11 + (end + 1) * 7) % 12) / 100
            });
        }
    }

    function clamp(value, minimum, maximum) {
        return Math.min(maximum, Math.max(minimum, value));
    }

    function rgba(hex, alpha) {
        const cleaned = String(hex).replace("#", "").trim();
        const expanded = cleaned.length === 3
            ? cleaned.split("").map((character) => character + character).join("")
            : cleaned;
        const value = Number.parseInt(expanded, 16);

        if (!Number.isFinite(value)) {
            return `rgba(255, 179, 71, ${alpha})`;
        }

        return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
    }

    function activeIndexes() {
        return PILLARS[state.pillar] || PILLARS.company;
    }

    function stageProfile() {
        return STAGES[state.stage] || STAGES.startup;
    }

    function colours() {
        return RECOMMENDATIONS[state.recommendation] || RECOMMENDATIONS.company;
    }

    function eventValue(event, legacyKey) {
        const detail = event?.detail || {};
        return detail.value || detail[legacyKey] || "";
    }

    function setState(key, value, allowedValues) {
        if (!allowedValues.includes(value)) {
            return;
        }

        state[key] = value;
        draw(state.elapsed);
    }

    function handlePillar(event) {
        setState("pillar", eventValue(event, "pillar"), Object.keys(PILLARS));
    }

    function handleStage(event) {
        setState("stage", eventValue(event, "stage"), Object.keys(STAGES));
    }

    function handleRecommendation(event) {
        setState(
            "recommendation",
            eventValue(event, "recommendation"),
            Object.keys(RECOMMENDATIONS)
        );
    }

    function calculatePositions(elapsed) {
        const minimum = Math.min(state.width, state.height);
        const stage = stageProfile();
        const radius = clamp(minimum * 0.285 * stage.orbit, 72, minimum * 0.34);
        const centerX = state.width / 2;
        const centerY = state.height / 2 + minimum * 0.015;
        const rotation = reducedMotion ? 0 : elapsed * 0.035 * stage.speed;

        positions.forEach((position, index) => {
            const angle = -Math.PI / 2 + rotation + index * Math.PI * 2 / NODES.length;
            position.x = centerX + Math.cos(angle) * radius;
            position.y = centerY + Math.sin(angle) * radius;
        });

        return { minimum, radius, centerX, centerY };
    }

    function drawBackground(metrics, elapsed) {
        const palette = colours();
        const pulse = reducedMotion ? 0.8 : 0.76 + Math.sin(elapsed * 1.2) * 0.08;
        const glow = context.createRadialGradient(
            metrics.centerX,
            metrics.centerY,
            0,
            metrics.centerX,
            metrics.centerY,
            metrics.minimum * 0.48
        );

        glow.addColorStop(0, rgba(palette.active, 0.15 * pulse));
        glow.addColorStop(0.48, rgba(palette.secondary, 0.06));
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.fillStyle = glow;
        context.fillRect(0, 0, state.width, state.height);

        context.save();
        context.translate(metrics.centerX, metrics.centerY);
        context.strokeStyle = rgba(palette.secondary, 0.11);
        context.lineWidth = 1;

        for (let ring = 1; ring <= 3; ring += 1) {
            context.beginPath();
            context.arc(
                0,
                0,
                metrics.radius * (0.36 + ring * 0.2),
                0,
                Math.PI * 2
            );
            context.stroke();
        }

        context.restore();
    }

    function drawConnections() {
        const active = activeIndexes();
        const palette = colours();

        links.forEach((link) => {
            const start = positions[link.start];
            const end = positions[link.end];
            const highlighted = active.includes(link.start) || active.includes(link.end);

            context.beginPath();
            context.moveTo(start.x, start.y);
            context.lineTo(end.x, end.y);
            context.strokeStyle = rgba(
                highlighted ? palette.active : palette.secondary,
                highlighted ? 0.54 : 0.15
            );
            context.lineWidth = highlighted ? 1.35 : 0.8;
            context.stroke();
        });
    }

    function drawParticles(elapsed) {
        if (reducedMotion) {
            return;
        }

        const active = activeIndexes();
        const palette = colours();
        const speedScale = stageProfile().speed;

        links.forEach((link) => {
            const start = positions[link.start];
            const end = positions[link.end];
            const progress = (elapsed * link.speed * speedScale + link.offset) % 1;
            const highlighted = active.includes(link.start) || active.includes(link.end);
            const x = start.x + (end.x - start.x) * progress;
            const y = start.y + (end.y - start.y) * progress;

            context.beginPath();
            context.arc(x, y, highlighted ? 2.1 : 1.25, 0, Math.PI * 2);
            context.fillStyle = rgba(
                highlighted ? palette.active : "#ffffff",
                highlighted ? 0.95 : 0.42
            );
            context.fill();
        });
    }

    function drawCenter(metrics, elapsed) {
        const palette = colours();
        const pulse = reducedMotion ? 1 : 1 + Math.sin(elapsed * 1.8) * 0.045;
        const radius = metrics.minimum * 0.084 * pulse;
        const gradient = context.createRadialGradient(
            metrics.centerX - radius * 0.22,
            metrics.centerY - radius * 0.26,
            radius * 0.08,
            metrics.centerX,
            metrics.centerY,
            radius
        );

        gradient.addColorStop(0, "rgba(255, 255, 255, 0.98)");
        gradient.addColorStop(0.2, rgba(palette.active, 0.98));
        gradient.addColorStop(1, rgba(palette.secondary, 0.78));

        context.save();
        context.shadowColor = rgba(palette.active, 0.72);
        context.shadowBlur = radius * 0.85;
        context.beginPath();
        context.arc(metrics.centerX, metrics.centerY, radius, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();
        context.restore();

        context.beginPath();
        context.arc(metrics.centerX, metrics.centerY, radius * 1.48, 0, Math.PI * 2);
        context.strokeStyle = rgba(palette.active, 0.24);
        context.lineWidth = 1.2;
        context.stroke();
    }

    function drawNodes(metrics, elapsed) {
        const active = activeIndexes();
        const palette = colours();
        const baseRadius = clamp(metrics.minimum * 0.018, 5.5, 10);

        positions.forEach((position, index) => {
            const highlighted = active.includes(index);
            const pulse = reducedMotion ? 1 : 1 + Math.sin(elapsed * 2 + index) * 0.06;
            const radius = baseRadius * pulse * (highlighted ? 1.2 : 0.94);
            const gradient = context.createRadialGradient(
                position.x - radius * 0.3,
                position.y - radius * 0.3,
                radius * 0.12,
                position.x,
                position.y,
                radius
            );

            gradient.addColorStop(0, "rgba(255, 255, 255, 0.98)");
            gradient.addColorStop(
                0.34,
                rgba(highlighted ? palette.active : palette.secondary, 0.98)
            );
            gradient.addColorStop(
                1,
                rgba(highlighted ? palette.active : palette.secondary, 0.48)
            );

            context.save();
            context.shadowColor = rgba(
                highlighted ? palette.active : palette.secondary,
                highlighted ? 0.9 : 0.42
            );
            context.shadowBlur = highlighted ? radius * 2.4 : radius * 1.5;
            context.beginPath();
            context.arc(position.x, position.y, radius, 0, Math.PI * 2);
            context.fillStyle = gradient;
            context.fill();
            context.restore();
        });
    }

    function updateLabels(metrics) {
        const active = activeIndexes();
        const offset = clamp(metrics.minimum * 0.047, 18, 34);

        positions.forEach((position, index) => {
            const dx = position.x - metrics.centerX;
            const dy = position.y - metrics.centerY;
            const magnitude = Math.hypot(dx, dy) || 1;
            const normalX = dx / magnitude;
            const normalY = dy / magnitude;
            const label = labels[index];
            let translateX = "-50%";
            let translateY = "-50%";

            if (normalX > 0.35) translateX = "0%";
            if (normalX < -0.35) translateX = "-100%";
            if (normalY > 0.35) translateY = "0%";
            if (normalY < -0.35) translateY = "-100%";

            label.style.left = `${position.x + normalX * offset}px`;
            label.style.top = `${position.y + normalY * offset}px`;
            label.style.transform = `translate(${translateX}, ${translateY})`;
            label.dataset.active = active.includes(index) ? "true" : "false";
        });
    }

    function draw(elapsed = 0) {
        if (state.destroyed || state.width <= 0 || state.height <= 0) {
            return;
        }

        context.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
        context.clearRect(0, 0, state.width, state.height);

        const metrics = calculatePositions(elapsed);
        drawBackground(metrics, elapsed);
        drawConnections();
        drawParticles(elapsed);
        drawCenter(metrics, elapsed);
        drawNodes(metrics, elapsed);
        updateLabels(metrics);
    }

    function measure() {
        if (state.destroyed) {
            return;
        }

        const rect = container.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width || container.clientWidth || 520));
        const height = Math.max(
            1,
            Math.round(rect.height || container.clientHeight || Math.max(260, width * 0.75))
        );
        const pixelRatio = clamp(window.devicePixelRatio || 1, 1, 2);

        state.width = width;
        state.height = height;
        state.pixelRatio = pixelRatio;
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        draw(state.elapsed);
    }

    function scheduleMeasure() {
        window.cancelAnimationFrame(state.resizeFrame);
        state.resizeFrame = window.requestAnimationFrame(measure);
    }

    function animate(timestamp) {
        if (!state.running || state.destroyed) {
            return;
        }

        if (!state.lastTimestamp) {
            state.lastTimestamp = timestamp;
        }

        const delta = Math.min(0.05, Math.max(0, (timestamp - state.lastTimestamp) / 1000));
        state.lastTimestamp = timestamp;

        if (state.visible && !document.hidden) {
            state.elapsed += delta;
            draw(state.elapsed);
        }

        state.animationFrame = window.requestAnimationFrame(animate);
    }

    function start() {
        if (state.destroyed || state.running || reducedMotion) {
            draw(state.elapsed);
            return;
        }

        state.running = true;
        state.lastTimestamp = 0;
        state.animationFrame = window.requestAnimationFrame(animate);
    }

    function stop() {
        state.running = false;
        state.lastTimestamp = 0;
        window.cancelAnimationFrame(state.animationFrame);
        state.animationFrame = 0;
    }

    function handleMotionChange(event) {
        reducedMotion = event.matches;

        if (reducedMotion) {
            stop();
            draw(state.elapsed);
        } else {
            start();
        }
    }

    const resizeObserver = "ResizeObserver" in window
        ? new ResizeObserver(scheduleMeasure)
        : null;
    const intersectionObserver = "IntersectionObserver" in window
        ? new IntersectionObserver((entries) => {
            state.visible = Boolean(entries[0]?.isIntersecting);
            if (state.visible) draw(state.elapsed);
        }, { rootMargin: "120px" })
        : null;

    function destroy() {
        if (state.destroyed) {
            return;
        }

        state.destroyed = true;
        stop();
        window.cancelAnimationFrame(state.resizeFrame);
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
        window.removeEventListener("resize", scheduleMeasure);
        window.removeEventListener("orientationchange", scheduleMeasure);
        document.removeEventListener("dnaChange", handlePillar);
        document.removeEventListener("growthStageChange", handleStage);
        document.removeEventListener("recommendationChange", handleRecommendation);

        if (typeof motionQuery.removeEventListener === "function") {
            motionQuery.removeEventListener("change", handleMotionChange);
        } else {
            motionQuery.removeListener(handleMotionChange);
        }

        canvas.remove();
        labelLayer.remove();
        container.dataset.ready = "false";
    }

    document.addEventListener("dnaChange", handlePillar);
    document.addEventListener("growthStageChange", handleStage);
    document.addEventListener("recommendationChange", handleRecommendation);
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("orientationchange", scheduleMeasure, { passive: true });

    if (typeof motionQuery.addEventListener === "function") {
        motionQuery.addEventListener("change", handleMotionChange);
    } else {
        motionQuery.addListener(handleMotionChange);
    }

    resizeObserver?.observe(container);
    intersectionObserver?.observe(container);
    measure();
    start();

    container.dataset.ready = "true";

    const controller = Object.freeze({
        renderer: "canvas-2d",
        ready: true,
        render: () => draw(state.elapsed),
        resize: scheduleMeasure,
        destroy,
        getState: () => ({
            activePillar: state.pillar,
            activeStage: state.stage,
            activeRecommendation: state.recommendation,
            width: state.width,
            height: state.height,
            reducedMotion,
            running: state.running
        })
    });

    window.GrowWithHRIntelligenceCore = controller;

    document.dispatchEvent(new CustomEvent("growwithhr:intelligence-core-ready", {
        detail: {
            renderer: controller.renderer,
            width: state.width,
            height: state.height
        }
    }));
})();