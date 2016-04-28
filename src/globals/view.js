Bot.View = function View(){
	var workspace = Blockly.inject('blocklyDiv', {
		media: 'node_modules/blockly/media/',
		toolbox: document.getElementById('toolbox')
	});
	Blockly.Xml.domToWorkspace(document.getElementById('startBlocks'), workspace);

	var handleFileSelect = function handleFileSelect(e) {
		var files;
		if (e.type === 'drop') {
			e.stopPropagation();
			e.preventDefault();
			files = e.dataTransfer.files;
		} else {
			files = e.target.files;
		}
		files = Array.prototype.slice.apply( files );
		var file = files[0];
		if ( file ) {
			if (file.type.match('text/xml')) {
				readFile(file);
			} else {
				Bot.utils.log('File: ' + file.name + ' is not supported.', 'info');
			}
		}
	};

	var readFile = function readFile(f) {
		reader = new FileReader();
		reader.onload = (function (theFile) {
			return function (e) {
				try {
					Blockly.mainWorkspace.clear();
					var xml = Blockly.Xml.textToDom(e.target.result);
					Blockly.Xml.domToWorkspace(xml, Blockly.mainWorkspace);
					Bot.utils.addPurchaseOptions();
					var tokenList = Bot.utils.getStorageManager().getTokenList();
					if ( tokenList.length !== 0 ) {
						Blockly.mainWorkspace.getBlockById('trade').getField('ACCOUNT_LIST').setValue(tokenList[0].token);
						Blockly.mainWorkspace.getBlockById('trade').getField('ACCOUNT_LIST').setText(tokenList[0].account_name);
					}
					Blockly.mainWorkspace.clearUndo();
					Bot.utils.log('Blocks are loaded successfully', 'success');
				} catch(e){
					Bot.utils.showError(e);
				}
			};
		})(f);
		reader.readAsText(f);
	};

	var handleDragOver = function handleDragOver(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
	};

	var dropZone = document.getElementById('drop_zone');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
	document.getElementById('files')
		.addEventListener('change', handleFileSelect, false);

	$('#tutorialButton').bind('click', Bot.startTutorial);
	$('#stopButton').text('Reset');
	$('#stopButton').bind('click', Bot.reset);

	$('#summaryPanel .exitPanel').click(function(){
		$(this).parent().hide();
	});

	$('#summaryPanel').hide();

	$('#summaryPanel').drags();

	$('#chart').mousedown(function(e){ // allow default chart mousedown actions
		e.stopPropagation();
	});

	var BinaryChart = window['binary-charts'];
	Bot.chart = BinaryChart.createChart('chart', { ticks: [] });
	Blockly.mainWorkspace.getBlockById('trade').setDeletable(false);
	Blockly.mainWorkspace.getBlockById('strategy').setDeletable(false);
	Blockly.mainWorkspace.getBlockById('finish').setDeletable(false);
	Bot.utils.updateTokenList();
	Bot.utils.addPurchaseOptions();
	Blockly.mainWorkspace.clearUndo();
};