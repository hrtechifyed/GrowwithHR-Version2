/**
 * GrowWithHR Organization Intelligence Module
 *
 * The shared Intelligence Engine invokes the structured deterministic
 * Organization engine. Organization has no authority over compliance
 * applicability and exposes no arbitrary maturity score.
 */

import intelligenceEngine from "../../core/intelligence-engine.js";
import engine from "./engine.js";

const MODULE = "organization";

intelligenceEngine.register({
    name: MODULE,
    version: "2.0.0-structured",
    analyze: engine.analyze.bind(engine)
});

export default engine;
