define("FileDetailV2", [], function() {
	return {
		methods: {
			onFileSelect: function(files) {
				if (this.entitySchemaName == "UsrRealtyFile") {
					if (files.length < 1) {
						return;
					}
					for (var i in files) {
						var fileItem = files[i];
						var name = fileItem.name;
						var extArray = name.split(".");
						var extension = extArray[extArray.length - 1];
						if (extension != "zip") {
							return;
						}
					}
				}
				this.callParent(arguments);
			},
		}
	};
});