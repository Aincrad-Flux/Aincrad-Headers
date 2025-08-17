// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');

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

		// Resolve project name (workspace folder name) and file path relative to workspace root
		let projectName = 'Aincrad-Flux';
		let relPath = fileName;
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(doc.uri);
		if (workspaceFolder && workspaceFolder.uri && workspaceFolder.uri.fsPath) {
			projectName = workspaceFolder.name;
			try {
				relPath = path.relative(workspaceFolder.uri.fsPath, fileName) || path.basename(fileName);
			} catch {
				relPath = fileName;
			}
		} else if (fileName) {
			// fallback: use parent folder name as project and file basename as relative path
			projectName = path.basename(path.dirname(fileName)) || projectName;
			relPath = path.relative(process.cwd(), fileName) || path.basename(fileName);
		}

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
	// Use ISO date YYYY-MM-DD for consistency
	const dateStr = now.toISOString().slice(0, 10);
		const headerLines = [];
		const open = style.open.trimEnd();
		const close = style.close ? ' ' + style.close : '';

	headerLines.push(open + '--------------- ' + projectName + ' ---------------' + close);
	headerLines.push(open + ' Project : ' + projectName + close);
	headerLines.push(open + ' File : ' + relPath + close);
		headerLines.push(open + '' + close);
	headerLines.push(open + ' Date : ' + dateStr + close);
	headerLines.push(open + ' Version : 1.0' + close);
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
