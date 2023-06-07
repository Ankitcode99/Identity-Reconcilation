const {fetchContacts, 
    createNewContact, 
    consolidateLinkedContacts, 
    createSecondaryContact, 
    linkMatchingRecords,
    getRecordById,
    getAllLinkedRecords} = require("../utils/utils")

const UserController = {
    consolidateContact: async(request, response) => {

        var {email, phoneNumber} = request.body;

        if(email === null || email === undefined)
            email = null;
        if(phoneNumber === null || phoneNumber === undefined)
            phoneNumber = null;

        try {
            const queryResult = await fetchContacts(email, phoneNumber) // fetch contacts where either the input email or phoneNumber matches

            var result; // the final result object to be returned

            if (queryResult.rows.length === 0) { // No matching contacts found so create a new record
                record = await createNewContact(email, phoneNumber);
                result = consolidateLinkedContacts(record)
            }else if (queryResult.rows.length === 1) {
                const record = queryResult.rows[0];
                if(record.email === email && record.phonenumber === phoneNumber) { // in-case of duplicate record for a primary account just return all the linked record
                    var allLinkedRecords = await getAllLinkedRecords(record.id);
                    result = consolidateLinkedContacts(allLinkedRecords)
                }else{
                    if(record.linkprecedence==="secondary"){
                        record = await getRecordById(record.linkedid)
                    }
                    linkedContacts = await createSecondaryContact({email, phoneNumber}, record);
                    result = consolidateLinkedContacts(linkedContacts)
                }
            }else{
                const duplicateInput = queryResult.rows
                                            .filter(record => record.email === email)
                                            .filter(record => record.phonenumber === phoneNumber)
                                            .map(record => ({id:record.id, linkedId: record.linkedid, linkPrecedence: record.linkprecedence}))
                
                if(duplicateInput.length > 0 ){
                    var primaryRecordId = duplicateInput[0].id;
                    if(duplicateInput[0].linkPrecedence === "secondary"){ // if the duplicate record was a secondary record, find its linkedId and get all records linked to it.
                        primaryRecordId = duplicateInput[0].linkedId
                    }
                    var allLinkedRecords = await getAllLinkedRecords(primaryRecordId);
                    result = consolidateLinkedContacts(allLinkedRecords)
                }else{
                    /**
                     * Altogether a mixed combination is given so merge 2 individual set of linked records
                     */
                    result = await linkMatchingRecords({email, phoneNumber}, queryResult.rows);
                }
            }

            response.status(201).json(result);
        } catch (error) {
            console.error(`An unexpected error occurred - ${error}`);
            response.status(500).json({
                message: "Something went wrong!"
            })
        }
    },
}

module.exports = UserController;