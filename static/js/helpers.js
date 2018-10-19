import React from 'react';
export function removeDuplicateClasses(classList){
    /* Sorts by id so that the same class is not duplicated*/
    let keysAlreadyFound = [];
    let noDuplicateList = [];
    for (let i = 0; i < classList.length; i++){
        const id = classList[i].id;
        if (keysAlreadyFound.indexOf(id) === -1){
            keysAlreadyFound.push(id);
            noDuplicateList.push(classList[i]);
        }
    }
    return noDuplicateList;
}

export function uniqueKey(){
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
}




export function getTermsOfService() {
        return (
           <p className='ToC'>
               Terms of Service
            <br/><br/>
            1.     Under this End User License Agreement (the “Agreement”), AvocadoCore (the “Vendor”) grants to the user (the “Licensee”) a non-exclusive and non-transferable license (the “License”) to use AVO(the “Software”).
            <br/><br/>
            2.     “Software” includes the executable computer programs and any related printed, electronic and online documentation and any other files that may accompany the product.
            <br/><br/>
            3.     Title, copyright, intellectual property rights and distribution rights of the Software remain exclusively with the Vendor. Intellectual property rights include the look and feel of the Software.
            <br/><br/>
            4.     The rights and obligations of this Agreement are personal rights granted to the Licensee only. The Licensee may not transfer or assign any of the rights or obligations granted under this Agreement to any other person or legal entity. The Licensee may not make available the Software for use by one or more third parties.
            <br/><br/>
            5.     The Software may not be modified, reverse-engineered, or de-compiled in any manner through current or future available technologies.
            <br/><br/>
            6.     Failure to comply with any of the terms under the License section will be considered a material breach of this Agreement.
              <br/><br/>
             License Fee
            <br/><br/>
            7.     The original purchase price paid by the Licensee will constitute the entire license fee and is the full consideration for the Agreement.
              <br/><br/>
             Limitation of Liability
            <br/><br/>
            8.     The Software is provided by the Vendor and accepted by the Licensee “as is”. Liability of the Vendor will be limited to a maximum of the original purchase price of the Software. The Vendor will not be liable for any general, special, incidental or consequential damages including, but not limited to, loss of productions, loss of profits, loss of revenue, loss of data, or any other business or economic disadvantage suffered by the Licensee arising out of the use or failure to use the Software.
            <br/><br/>
            9.     The Vendor makes no warranty expressed or implied regarding the fitness of the Software for a particular purpose or that the Software will be suitable or appropriate for the specific requirements of the Licensee.
            <br/><br/>
            10.    The Vendor does not warrant that use of the Software will be uninterrupted or error-free. TheLicensee accepts that software in general is prone to bugs and flaws within an acceptable level as determined in the industry. Warrants and Representations
            <br/><br/>
            11.  The Vendor warrants and represents that it is the copyright holder of the Software. The Vendor warrants and represents that granting the license to use this Software is not in violation of any other agreement, copyright or applicable statute.
              <br/><br/>
             Acceptance
            <br/><br/>
            12.  All terms, conditions and obligations of this Agreement will be deemed to be accepted by theLicensee (“Acceptance”) on registration of the Software with the Vendor.User Support
            <br/><br/>
            13.  No user support or maintenance is provided as part of this Agreement.
              <br/><br/>
             Term
            <br/><br/>
            14.  The term of this Agreement will begin on Acceptance and is perpetual.
              <br/><br/>
             Termination
            <br/><br/>
            15.  This Agreement will be terminated and the License forfeited where the Licensee has failed to comply with any of the terms of this Agreement or is in breach of this Agreement. On termination of this Agreement for any reason, the Licensee will promptly destroy the Software or return the Software tot he Vendor.Force Majeure
            <br/><br/>
            16.  The Vendor will be free of liability to the Licensee where the Vendor is prevented from executing its obligations under this Agreement in whole or in part due to Force Majeure, such as earthquake, flood,
            fire or any other unforeseen and uncontrollable event where the Vendor has taken any and all appropriate action to mitigate such an event.
            <br/><br/>
            17.  The Vendor is able to update the agreement in the future whereupon an email will be sent with the updated agreement. Continued use will mean that the user agrees to the new agreement.
            <br/><br/>
            18.  Additional clause 2 Governing Law
            <br/><br/>
            19.  The Parties to this Agreement submit to the jurisdiction of the courts of the Province of Ontario for the enforcement of this Agreement or any arbitration award or decision arising from this Agreement.This Agreement will be enforced or construed according to the laws of the Province of Ontario.
              <br/><br/>
             Miscellaneous
            <br/><br/>
            20.  This Agreement can only be modified in writing signed by both the Vendor and the Licensee.
            <br/><br/>
            21.  This Agreement does not create or imply any relationship in agency or partnership between theVendor and the Licensee.
            <br/><br/>
            22.  Headings are inserted for the convenience of the parties only and are not to be considered when interpreting this Agreement. Words in the singular mean and include plural and vice versa. Words in the masculine gender include the feminine gender and vice versa. Words in the neuter gender include the masculine gender and the feminine gender and vice versa.
            <br/><br/>
            23.  If any term, covenant, condition or provision of this Agreement is held by a court of competent jurisdiction to be invalid, void or unenforceable, it is the parties’ intent that such provision be reduced in scope by the court only to the extent deemed necessary by that court to render the provision reasonable and enforceable and the remainder of the provisions of this Agreement will in no way be affected, impaired or invalidated as a result.
            <br/><br/>
            24.  This Agreement contains the entire agreement between the parties. All understandings have been included in this Agreement. Representations which may have been made by any party to thisAgreement may in some way be inconsistent with this final written Agreement. All such statements are declared to be of no value in this Agreement. Only the written terms of this Agreement will bind the parties.
            <br/><br/>
            25.  This Agreement and the terms and conditions contained in this Agreement apply to and are binding upon the Vendor’s successors and assigns.
               <br/><br/>
               ----------------------------------------------------------------------------------
               <br/><br/>
             Privacy Policy
            <br/><br/>
            26.  AvocadoCore receives authorization and consent from Users to collect, process and otherwise handle personal Information under this Privacy Policy when the user: (a) purchases the services; (b)establishes an account or registers to use the services; (c) accesses the services through account credentials that an educator has associated with the user’s personal information, such as through an institution’s course or learning management system; or (d) uses the Services.
            <br/><br/>
            27.  AvocadoCore collects and processes account data to set up, maintain and enable a user account to use the services. Account data includes a user’s first and last name, student number, email address, username and password, the institution and course identifier for any courses for which user uses the services, as well as data that helps develop and maintain AI processing technology.
            <br/><br/>
            28.  Course data means educational data collected, generated or processed through use of the services in connection with educational coursework. Course data includes assignments, student coursework,responses to interactive exercises, assignments and tests, scores, grades and instructor comments.AvocadoCore collects and processes course data in order to provide the services to users, educators and institutions for educational purposes.
            <br/><br/>
            29.  Course data is utilized in the training and use of Artificial Intelligence. This data collected includes questions, response to questions, marks of assignments and tests, mark of questions, mark of sets and response to teaching tools. AvocadoCore uses this data to train and test AvocadoCore’s ArtificialIntelligence system, To produce questions and tests for a student account based off of data collected and to give feedback to teachers based off of data collected.
            <br/><br/>
            30.  To protect personal Information, users, educators and institutions are urged to: (a) protect and never share their passwords; (b) only access the services using secure networks; (c) maintain updated internet security and virus protection software on their devices and computer systems; (d)immediately change a password and contact AvocadoCore support if there is a suspicion that the password has been compromised; and (e) contact AvocadoCore support if there is another security or privacy concern or issue.
            </p>
        );
    };


// For Henrik to do work on stuff

export const studentClass = {"classes":[{"enrollKey":"hBw2lD4sEg","id":8,"name":"Passini 1600","tests":[{"attempts":-1,"current":null,"deadline":"201904170000","id":28,"name":"Set 1","open":1,"submitted":[],"timer":100,"total":11},{"attempts":-1,"current":null,"deadline":"202002120000","id":29,"name":"Set 2","open":1,"submitted":[],"timer":100,"total":14},{"attempts":-1,"current":null,"deadline":"202002120000","id":30,"name":"Set 3","open":1,"submitted":[],"timer":100,"total":15},{"attempts":-1,"current":null,"deadline":"202002120000","id":31,"name":"Set 4","open":1,"submitted":[],"timer":100,"total":15},{"attempts":-1,"current":null,"deadline":"202012020000","id":32,"name":"Set 5","open":1,"submitted":[],"timer":100,"total":14},{"attempts":-1,"current":null,"deadline":"202012020000","id":33,"name":"Set 6","open":1,"submitted":[],"timer":100,"total":15},{"attempts":-1,"current":null,"deadline":"202012020000","id":34,"name":"Set 7","open":1,"submitted":[],"timer":100,"total":10},{"attempts":-1,"current":null,"deadline":"202012020000","id":35,"name":"Set 8","open":1,"submitted":[],"timer":100,"total":15},{"attempts":-1,"current":null,"deadline":"202012020000","id":36,"name":"Set 9","open":1,"submitted":[],"timer":100,"total":24},{"attempts":-1,"current":null,"deadline":"202012020000","id":37,"name":"Set 10","open":1,"submitted":[],"timer":100,"total":21},{"attempts":-1,"current":null,"deadline":"202012020000","id":38,"name":"Set 11","open":1,"submitted":[],"timer":100,"total":15}]}]};
export const teacherClass = {
  "classes":[
      {"enrollKey":"hBw2lD4sEg","id":8,"name":"Passini 1600",
      "tests":[{"attempts":-1,"current":null,"deadline":"201904170000","id":28,"name":"Set 1","open":1,
        "submitted":[
            {"grade":0,"takes":50,"timeSubmitted":20181001220146},
            {"grade":0,"takes":57,"timeSubmitted":20181008140045},
            {"grade":0,"takes":58,"timeSubmitted":20181009123931},
            {"grade":0,"takes":59,"timeSubmitted":20181009124032}],
            "timer":100,"total":11},
        {"attempts":-1,"current":null,"deadline":"202002120000","id":29,"name":"Set 2","open":1,"submitted":[],"timer":100,"total":14},
        {"attempts":-1,"current":null,"deadline":"202002120000","id":30,"name":"Set 3","open":1,"submitted":[],"timer":100,"total":15},
        {"attempts":-1,"current":null,"deadline":"202002120000","id":31,"name":"Set 4","open":1,"submitted":[],"timer":100,"total":15},
        {"attempts":-1,"current":null,"deadline":"202012020000","id":32,"name":"Set 5","open":1,"submitted":[],"timer":100,"total":14},
        {"attempts":-1,"current":null,"deadline":"202012020000","id":33,"name":"Set 6","open":1,"submitted":[],"timer":100,"total":15},
        {"attempts":-1,"current":null,"deadline":"202012020000","id":34,"name":"Set 7","open":1,"submitted":[],"timer":100,"total":10},
        {"attempts":-1,"current":null,"deadline":"202012020000","id":35,"name":"Set 8","open":1,"submitted":[],"timer":100,"total":15},
        {"attempts":-1,"current":null,"deadline":"202012020000","id":36,"name":"Set 9","open":1,"submitted":[],"timer":100,"total":24},
        {"attempts":-1,"current":null,"deadline":"202012020000","id":37,"name":"Set 10","open":1,"submitted":[],"timer":100,"total":21},
        {"attempts":-1,"current":null,"deadline":"202012020000","id":38,"name":"Set 11","open":1,"submitted":[],"timer":100,"total":15}]},
    {"enrollKey":"dm55UU8LXB","id":9,"name":"Passini 1229","tests":[{"attempts":-1,"current":null,"deadline":"202002120000","id":39,"name":"Set 1","open":1,"submitted":[{"grade":0,"takes":37,"timeSubmitted":20180927175717},{"grade":0,"takes":52,"timeSubmitted":20181007181042}],"timer":100,"total":8},{"attempts":-1,"current":null,"deadline":"202012020000","id":40,"name":"Set 2","open":1,"submitted":[],"timer":100,"total":8},{"attempts":-1,"current":null,"deadline":"202012020000","id":41,"name":"Set 3","open":1,"submitted":[],"timer":100,"total":8},{"attempts":-1,"current":null,"deadline":"202012010000","id":42,"name":"Set 4","open":1,"submitted":[],"timer":100,"total":8},{"attempts":-1,"current":null,"deadline":"202012020000","id":43,"name":"Set 5","open":1,"submitted":[],"timer":100,"total":8},{"attempts":-1,"current":null,"deadline":"202012020000","id":44,"name":"Set 6","open":1,"submitted":[{"grade":0,"takes":38,"timeSubmitted":20180927175751}],"timer":100,"total":8},{"attempts":-1,"current":null,"deadline":"201810311000","id":46,"name":"prova","open":0,"submitted":[{"grade":0,"takes":43,"timeSubmitted":20181001150959}],"timer":30,"total":1},{"attempts":-1,"current":null,"deadline":"201812202359","id":47,"name":"training2","open":1,"submitted":[{"grade":6,"takes":44,"timeSubmitted":20181001153200},{"grade":1,"takes":47,"timeSubmitted":20181001183916},{"grade":0,"takes":48,"timeSubmitted":20181001231943}],"timer":100,"total":6}]}]};
export const testResultsExample =
    [
        {
          "firstName":"Frank",
          "lastName":"2",
          "tests":[
              {"grade":64,"takes":34,"timeSubmitted":20180927144619},
              {"grade":80,"takes":35,"timeSubmitted":20180927144619}
              ],
          "user":10
        },
        {
          "firstName":"Henrik",
          "lastName":"1",
          "tests":[
               {"grade":70,"takes":36,"timeSubmitted":20180927144619},
              {"grade":90,"takes":37,"timeSubmitted":20180927144619}
          ],
          "user":9
        }

    ];
