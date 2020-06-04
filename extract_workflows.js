#!/usr/bin/env node 

const fs = require('fs');
const { exec } = require('child_process');


function getPushTriggeredWorkflowExistStatus() {
    return new Promise(resolve => {
        exec('ls ".github/workflows', (error, stdout, stderr) => {
            var file_names = stdout.split("\n");
            var workflow_triggers_on_push = 0;
            for(var file_name of file_names){
                if(file_name.length === 0)
                    continue;
                var file_content = fs.readFileSync('.github/workflows/'+file_name, "utf8").split("\n");
                // console.log(file_name+":");
                // console.log(file_content);

                for(var line_number = 0; line_number < file_content.length; line_number++){
                    // console.log(file_content[line_number]);
                    if(file_content[line_number].startsWith('on:', 0)){
                        var findingPushLineNumber = line_number;
                        while(findingPushLineNumber < file_content.length && !file_content[findingPushLineNumber].startsWith("  push:", 0)){
                            findingPushLineNumber++;
                        }
                        if(findingPushLineNumber !== file_content.length){
                            workflow_triggers_on_push = 1;
                        }
                        break;
                    }
                }
                if(workflow_triggers_on_push == 1)
                    break;
            }
            resolve(workflow_triggers_on_push);
        });
    });
}

(async function(){
    var workflow_triggers_on_push = await getPushTriggeredWorkflowExistStatus();
    console.log(workflow_triggers_on_push);
})();

