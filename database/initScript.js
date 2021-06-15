
const userChoices = require('../models/choicesSchema');

userChoices.countDocuments().then(userChoicesCount => {
    if (userChoicesCount == 0) {
        userChoices.insertMany([
            { header: "lastname", matchingString: ["lastname", "last name"] },
            { header: "firstname", matchingString: ["firstname", "first name"] },
            { header: "language", matchingString: ["language"] },
            { header: "payid", matchingString: ["payid"] },
            { header: "payid2", matchingString: ["payid2"] },
            { header: "payid3", matchingString: ["payid3"] },
            { header: "payid4", matchingString: ["payid4"] },
            { header: "payid5", matchingString: ["payid5"] },
            { header: "payid6", matchingString: ["payid6"] },
            { header: "mail", matchingString: ["mail"] },
            { header: "managermail", matchingString: ["managermail"] },
            { header: "managerpayid", matchingString: ["managerpayid"] },
            { header: "isadmin", matchingString: ["isadmin"] },
            { header: "isaccountant", matchingString: ["isaccountant"] },
            { header: "tags", matchingString: ["tags"] },
            { header: "localcountry", matchingString: ["localcountry"] },
            { header: "localcurrency", matchingString: ["localcurrency"] },
            { header: "reviewermail", matchingString: ["reviewermail"] },
            { header: "revieweriayid", matchingString: ["revieweriayid"] },
            { header: "defaultprojectexternalid", matchingString: ["defaultprojectexternalid"] },
            { header: "isactive", matchingString: ["isactive"] },
            { header: "mailalias", matchingString: ["mailalias"] },
            { header: "mileagerate", matchingString: ["mileagerate"] },
            { header: "ikreference", matchingString: ["ikreference"] }
        ]);
    }
});

