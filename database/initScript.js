
const userChoices = require('../models/choicesSchema');

userChoices.countDocuments().then(userChoicesCount => {
    if (userChoicesCount == 0) {
        userChoices.insertMany([
            { header: "LastName", matchingString: ["lastname"]},
            { header: "FirstName", matchingString: ["firstname"] },
            { header: "Language", matchingString: ["language"] },
            { header: "PayId", matchingString: ["payid"] },
            { header: "PayiId2", matchingString: ["payid2"] },
            { header: "PayId3", matchingString: ["payid3"] },
            { header: "PayId4", matchingString: ["payid4"] },
            { header: "PayId5", matchingString: ["payid5"] },
            { header: "PayId6", matchingString: ["payid6"] },
            { header: "Mail", matchingString: ["mail"] },
            { header: "ManagerMail", matchingString: ["managermail"] },
            { header: "ManagerPayId", matchingString: ["managerpayid"] },
            { header: "IsAdmin", matchingString: ["isadmin"] },
            { header: "IsAccountant", matchingString: ["isaccountant"] },
            { header: "Tags", matchingString: ["tags"] },
            { header: "LocalCountry", matchingString: ["localcountry"] },
            { header: "LocalCurrency", matchingString: ["localcurrency"] },
            { header: "ReviewerMail", matchingString: ["reviewermail"] },
            { header: "ReviewerPayId", matchingString: ["revieweriayid"] },
            { header: "DefaultProjectExternalId", matchingString: ["defaultprojectexternalid"] },
            { header: "IsActive", matchingString: ["isactive"] },
            { header: "MailAlias", matchingString: ["mailalias"] },
            { header: "MileageRate", matchingString: ["mileagerate"] },
            { header: "IKReference", matchingString: ["ikreference"] }
        ]);
    }
});

