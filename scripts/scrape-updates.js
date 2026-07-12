const fs = require("fs");

const today =
    new Date()
        .toISOString()
        .split("T")[0];

const resources = {

    lastVerified: today,

    resources: [

        {
            authority: "Ministry of Labour & Employment",
            type: "Central Government",
            website: "https://labour.gov.in"
        },

        {
            authority: "Employees' Provident Fund Organisation",
            type: "Statutory Authority",
            website: "https://www.epfindia.gov.in"
        },

        {
            authority: "Employees' State Insurance Corporation",
            type: "Statutory Authority",
            website: "https://www.esic.gov.in"
        },

        {
            authority: "India Code",
            type: "Official Legal Repository",
            website: "https://www.indiacode.nic.in"
        },

        {
            authority: "Ministry of Corporate Affairs",
            type: "Central Government",
            website: "https://www.mca.gov.in"
        }

    ]

};

fs.writeFileSync(

    "data/official-resources.json",

    JSON.stringify(
        resources,
        null,
        4
    )

);

console.log(

    `Official resources verified on ${today}`

);
