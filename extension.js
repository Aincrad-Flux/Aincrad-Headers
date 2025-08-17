// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "aincrad-headers" is now active!');

	// Register the generateHeader command
	const disposable = vscode.commands.registerCommand('aincrad-headers.generateHeader', async function () {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor to insert header.');
			return;
		}

		const doc = editor.document;
		const fullText = doc.getText();

		// Detect and preserve shebang
		let shebang = '';
		let insertPosition = new vscode.Position(0, 0);
		if (fullText.startsWith('#!')) {
			const firstLineEnd = fullText.indexOf('\n');
			shebang = firstLineEnd === -1 ? fullText : fullText.slice(0, firstLineEnd);
			insertPosition = new vscode.Position(1, 0);
		}

		// Determine comment style by languageId or file extension
		const languageId = doc.languageId;
		const fileName = doc.fileName || '';

		const COMMENT_STYLES = [
			{langs: ['cpp', 'c'], open: '// ', close: ''},
			{langs: ['java'], open: '// ', close: ''},
			{langs: ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'], open: '// ', close: ''},
			{langs: ['python', 'ruby', 'perl', 'shellscript'], open: '# ', close: ''},
			{langs: ['xml', 'html', 'xsl'], open: '<!-- ', close: ' -->'},
		];

		function pickStyle() {
			for (const s of COMMENT_STYLES) {
				if (s.langs.includes(languageId)) return s;
			}
			// fallback by extension
			if (/\.(h|hpp|hh)$/.test(fileName)) return {open: '// ', close: ''};
			if (/\.(c|cpp|cc|cxx)$/.test(fileName)) return {open: '// ', close: ''};
			if (/\.(java)$/.test(fileName)) return {open: '// ', close: ''};
			if (/\.(js|ts|jsx|tsx)$/.test(fileName)) return {open: '// ', close: ''};
			return {open: '// ', close: ''};
		}

		const style = pickStyle();

		// Build header lines
		const now = new Date();
		const dateStr = now.toLocaleDateString();
		const headerLines = [];
		const open = style.open.trimEnd();
		const close = style.close ? ' ' + style.close : '';

		headerLines.push(open + '--------------- Aincrad-Flux ---------------' + close);
		headerLines.push(open + ' Project :' + close);
		headerLines.push(open + ' file :' + close);
		headerLines.push(open + '' + close);
		headerLines.push(open + ' Date : ' + dateStr + close);
		headerLines.push(open + ' Vertion :' + close);
		headerLines.push(open + '' + close);
		headerLines.push(open + ' Description :' + close);
		headerLines.push(open + '--------------------------------------------' + close);

		const headerText = (shebang ? shebang + '\n' : '') + headerLines.join('\n') + '\n\n';

		await editor.edit(editBuilder => {
			editBuilder.insert(insertPosition, headerText);
		});

		vscode.window.showInformationMessage('Aincrad header inserted.');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
