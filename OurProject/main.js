/* This is the main JS Node file that will be run by user to get started */
//Package install => done
//Create give_inputs.txt => done
// get all pre-existing hook scripts => done
//Check if pre-commit or pre-push exist. If yes change their names. => done
//Create our version of open_workflow_run and pre-commit and pre-push => done
//apend the open_workflow_run and give_inputs.txt in .gitignore

const { exec } = require('child_process');
const fs = require('fs');

const input_keys = ['github_PAT', 'tenant_id', 'workflow', 'subscription', 'resource_group', 'resource'];


/**
 * Get the starter contents of the input file for the user
 * @return {String}		The content of the file that was at the time of installation
 */
function getInputFileContent(){
	var original_content = '';
	for(var input_key of input_keys){
		original_content += input_key + ": \n";
	}
	return original_content;
}
/**
 * Read the file contents
 * @param  {String}	file_name 	The name of the file to be read
 * @return {Promise}			The array of contents of the given file
 */
function getFileContent(file_name){
	return new Promise(resolve => {
		resolve(fs.readFileSync(file_name, "utf8"));
	});
}
/**
 * Rewrite the file with some content
 * @param  {String}	file_name 	the name of the file to be rewritten
 * @param  {String} content		The content to be written
 * @return {Promise}			Resolves after the contents have been written
 */
async function writeFile(file_name, content){	
	return new Promise(resolve => {
		fs.writeFile(file_name, content, function(err){
			if(err){
				console.log(err);
				exit(1);
			}
			resolve();
		});
	});
}
/**
 * Install all the dependencies requires by the project
 * @return {Promise} 	Resolves after the packages have been installed
 */
function installPackages(){
    console.log();
    console.log("Installing packages...");
    console.log();
    return new Promise(resolve => {
        exec('npm install fs express uuid open request tweetsodium', (error, stdout, stderr) => {
            console.log(stdout);
            resolve();
		});
    });
}
/**
 * Gets all the file names in a directory relative to the repository root directory
 * @param  {String}	dir_name 	The relative pah of directory whose file contents are required
 * @return {Promise}			Resolves the list of files in the directory
 */
function getFilesInDirectory(dir_name){
    return new Promise(resolve => {
        exec('ls "'+dir_name+'"', (error, stdout, stderr) => {
            resolve(stdout.split("\n"));
        });
    });
}
/**
 * Chech whether the file with same name exists or not
 * @param  {String}	files 	The list of all the files in the repository
 * @param  {String} file    The hook name to be checked & replace
 * @return {Boolean}		Return the boolean whether the file with same name exists or not
 */
function checkFileExists(files, file){
    for(var file_iterator = 0; file_iterator < files.length; file_iterator++){
        if(files[file_iterator] === file){
            return true;
        }
    }
    return false;
}
/**
 * Rename a file with new name
 * @param  {String}	oldFile 	The relative path to Old File
 * @param  {String} newFile     The relative path to New File
 * @return {Promise}		    Resolves after the file name has been changes
 */
function renameFile(oldFile, newFile){
    return new Promise(resolve => {
        fs.rename(oldFile, newFile, () => {
            resolve();
        })
    })
}

function appendFiles(file_name, files){
    return new Promise(resolve => {
        fs.appendFile('.gitignore', files, () => {
            resolve();
        });
    });
}

async function main(){
    await installPackages();
    const original_content = await getInputFileContent();
    await writeFile('give_inputs.txt', original_content);
    var hooks = await getFilesInDirectory(".git/hooks");
    if(checkFileExists(hooks, "pre-commit")){
        renameFile(".git/hooks/pre-commit", ".git/hooks/pre-commit-changedByApp");
    }
    if(checkFileExists(hooks, "pre-push")){
        renameFile(".git/hooks/pre-push", ".git/hooks/pre-push-changedByApp");
    }
    var open_workflow_run_text = await getFileContent('OurProject/open_workflow_run');
    await writeFile('open_workflow_run', open_workflow_run_text);

    var pre_push_text = await getFileContent('OurProject/pre-push');
    await writeFile('.git/hooks/pre-push', pre_push_text);

    var pre_commit_text = await getFileContent('OurProject/pre-commit');
    await writeFile('.git/hooks/pre-commit', pre_commit_text);

    var extra_files = ['', '/open_workflow_run', '/give_inputs.txt', 'OurProject/'];
    await appendFiles('.gitignore', extra_files.join("\n"));
}

main();