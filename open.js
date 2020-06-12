// var openInEditor = require('open-in-editor');
// var editor = openInEditor.configure({
//     editor: 'code'
// }, function(err){
//     console.error('Something went wrong: ' + err);
// });
// editor.open('give_inputs.txt')
// .then(function() {
//     console.log('Success!');
// }, function(err) {
//     console.error('Something went wrong: ' + err);
// })


const launch = require('launch-editor')
launch('workflow.yml');