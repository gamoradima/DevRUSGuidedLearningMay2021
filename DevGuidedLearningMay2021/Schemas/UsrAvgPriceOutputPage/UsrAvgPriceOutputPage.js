define("UsrAvgPriceOutputPage", [], function() {
	return {
		entitySchemaName: "",
		attributes: {},
		modules: /**SCHEMA_MODULES*/{}/**SCHEMA_MODULES*/,
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		businessRules: /**SCHEMA_BUSINESS_RULES*/{}/**SCHEMA_BUSINESS_RULES*/,
		methods: {},
		dataModels: /**SCHEMA_DATA_MODELS*/{}/**SCHEMA_DATA_MODELS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "Button-cc102ed5366347ce94a2afb9097f8fda",
				"values": {
					"itemType": 5,
					"id": "132c15fc-0097-4b6e-817d-1f22f24f6ff5",
					"style": "green",
					"tag": "Button1",
					"caption": {
						"bindTo": "Resources.Strings.Button1ButtonCaption"
					},
					"click": {
						"bindTo": "onSaveButtonClick"
					},
					"enabled": true
				},
				"parentName": "ProcessActionButtons",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "Button-5bc69917e33d4310be3686c256cacf10",
				"values": {
					"itemType": 5,
					"id": "003d5b25-d49e-4262-986b-d2d94024c3fa",
					"style": "green",
					"tag": "Button2",
					"caption": {
						"bindTo": "Resources.Strings.Button2ButtonCaption"
					},
					"click": {
						"bindTo": "onSaveButtonClick"
					},
					"enabled": true
				},
				"parentName": "ProcessActionButtons",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "FLOAT6726adf2-3d3a-4aeb-8e41-1aa984bca98c",
				"values": {
					"layout": {
						"colSpan": 8,
						"rowSpan": 1,
						"column": 7,
						"row": 5,
						"layoutName": "Header"
					},
					"bindTo": "UsrAvgPrice",
					"enabled": false
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 0
			}
		]/**SCHEMA_DIFF*/
	};
});
