define("UsrRealty1Page", ["UsrRealtyConsts", "ServiceHelper"], function(UsrRealtyConsts, ServiceHelper) {
	return {
		entitySchemaName: "UsrRealty",
		attributes: {
			"CommissionUSD": {
				"dataValueType": this.Terrasoft.DataValueType.FLOAT,
				"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				"value": 0,
				 dependencies: [
                    {
                        // Значение колонки [CommissionUSD] зависит от значений колонок [UsrPriceUSD] 
                        // и [UsrOfferType].
                        columns: ["UsrPriceUSD", "UsrOfferType"],
                        // Метод-обработчик, который вызывается при изменении значения любой из влияющих колонок
                        methodName: "calculateCommission"
                    }
                ]
			},
			"UsrOfferType": {
				lookupListConfig: {
					columns: ["UsrCommissionCoeff"]
				}
			}
		},
		modules: /**SCHEMA_MODULES*/{}/**SCHEMA_MODULES*/,
		details: /**SCHEMA_DETAILS*/{
			"Files": {
				"schemaName": "FileDetailV2",
				"entitySchemaName": "UsrRealtyFile",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "UsrRealty"
				}
			},
			"UsrRealtyVisitDetail": {
				"schemaName": "UsrRealtyVisitDetail",
				"entitySchemaName": "UsrRealtyVisit",
				"filter": {
					"detailColumn": "UsrRealty",
					"masterColumn": "Id"
				}
			}
		}/**SCHEMA_DETAILS*/,
		businessRules: /**SCHEMA_BUSINESS_RULES*/{
			"UsrComment": {
				"955d5280-7bf1-42af-b607-3431e143da5d": {
					"uId": "955d5280-7bf1-42af-b607-3431e143da5d",
					"enabled": true,
					"removed": false,
					"ruleType": 0,
					"property": 2,
					"logical": 0,
					"conditions": [
						{
							"comparisonType": 7,
							"leftExpression": {
								"type": 1,
								"attribute": "UsrPriceUSD"
							},
							"rightExpression": {
								"type": 0,
								"value": 100000,
								"dataValueType": 5
							}
						}
					]
				}
			}
		}/**SCHEMA_BUSINESS_RULES*/,
		methods: {
			calculateCommission: function() {
				var price = this.get("UsrPriceUSD");
				var offerTypeObject = this.get("UsrOfferType");
				var result = 0;
				if (offerTypeObject) {
					var coeff = offerTypeObject.UsrCommissionCoeff;
					result = price * coeff;
				}
				this.set("CommissionUSD", result);
				this.console.log("CommissionUSD = " + result);
			},
			onEntityInitialized: function() {
				this.callParent();
				this.calculateCommission();
				this.setRealtyNumber();				
			},
			setRealtyNumber: function() {
				if (this.isAddMode() || this.isCopyMode()) {
                    // Вызов базового метода Terrasoft.BasePageV2.getIncrementCode, который генерирует номер
                    // по заданной ранее маске.
                    this.getIncrementCode(function(response) {
                        // Сгенерированный номер возвращается в колонку [UsrCode].
                        this.set("UsrCode", response);
                    });
                }
			},			
			onMyButtonClick: function() {
				this.console.log("Наша кнопка работает!");
			},
			getMyButtonEnabled: function() {
				var result = true;
				var name = this.get("UsrName");
				if (!name) {
					result = false;
				}
				
				return result;
			},
			setValidationConfig: function() {
                this.callParent(arguments);
                this.addColumnValidator("UsrPriceUSD", this.positiveValueValidator);
                this.addColumnValidator("UsrAreaM2", this.positiveValueValidator);
            },
			positiveValueValidator: function(value, column) {
				this.console.log("positiveValueValidator called.");
				var msg = "";
				if (value < 0) {
					msg = this.get("Resources.Strings.ValueMustBePositive");
				}
				return {
					invalidMessage: msg
				};
			},
			asyncValidate: function(callback, scope) {
				this.callParent([
					function(response) {
						if (!this.validateResponse(response)) {
							return;
						}
						this.validateRealtyData(function(response) {
							if (!this.validateResponse(response)) {
								return;
							}
							callback.call(scope, response);
						}, this);
					},
				this]);
			},
			validateRealtyData: function(callback, scope) {
				// create query for server side
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "UsrRealty"
				});
				esq.addAggregationSchemaColumn("UsrPriceUSD", Terrasoft.AggregationType.SUM, "PriceSum"); // select SUM(UsrPriceUSD) as PriceSum from UsrRealty
				var saleFilter = esq.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL, // WHERE UsrOfferType = продажа
							"UsrOfferType", UsrRealtyConsts.OfferType.Sale);
				esq.filters.addItem(saleFilter);
				// run query
				esq.getEntityCollection(function(response) {
					if (response.success && response.collection) {
						var sum = 0;
						var items = response.collection.getItems();
						if (items.length > 0) {
							sum = items[0].get("PriceSum");
						}
						var max = 2000000;
						if (sum > max) {
							if (callback) {
								callback.call(this, {
									success: false,
									message: "You cannot save, because sum = " + sum + " is bigger than " + max
								});
							}
						} else
						if (callback) {
							callback.call(scope, {
								success: true
							});
						}
					}
				}, this);
			},
			onRunWebServiceButtonClick: function() {
				var typeIdObject = this.get("UsrType");
				if (!typeIdObject) {
					return;
				}
				var typeId = typeIdObject.value;
				var dataObject = {
					realtyTypeId: typeId
				};
				ServiceHelper.callService("RealtyService", "GetTotalAmountByTypeId", this.getWebServiceResult, dataObject, this);
			},
			getWebServiceResult: function(response, success) {
				if (success) {
					this.Terrasoft.showInformation("Total amount by typeId: " + response.GetTotalAmountByTypeIdResult);
				}
			}
			
		},
		dataModels: /**SCHEMA_DATA_MODELS*/{}/**SCHEMA_DATA_MODELS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "STRING94656931-d633-4e40-9769-ee1be2b311ea",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrCode",
					"enabled": false
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrName9a8d71cd-0893-4c46-9c8f-c549b9316861",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 1,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrName"
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "FLOATfa51ca9a-3ef8-480a-a0de-bd2b0a053c03",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 2,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrPriceUSD",
					"enabled": true
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "FLOAT551349ec-305b-4ac0-81e4-2662853f2bef",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 3,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrAreaM2",
					"enabled": true
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "CommissionUSDControl",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 4,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "CommissionUSD",
					"caption": {
						"bindTo": "Resources.Strings.CommissionCaption"
					},
					"enabled": false
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 4
			},
			{
				"operation": "insert",
				"name": "MyButton",
				"values": {
					"itemType": 5,
					"caption": {
						"bindTo": "Resources.Strings.MyButtonCaption"
					},
					"click": {
						"bindTo": "onMyButtonClick"
					},
					"enabled": {
						"bindTo": "getMyButtonEnabled"
					},
					"style": "blue",
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 5,
						"layoutName": "ProfileContainer"
					}
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 5
			},
			{
				"operation": "insert",
				"name": "RunWebServiceButton",
				"values": {
					"itemType": 5,
					"caption": {
						"bindTo": "Resources.Strings.RunWebServiceButton"
					},
					"click": {
						"bindTo": "onRunWebServiceButtonClick"
					},
					"style": "red",
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 6,
						"layoutName": "ProfileContainer"
					}
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 6
			},
			{
				"operation": "insert",
				"name": "LOOKUPd384d9a2-b5e3-4775-a643-be52bc968734",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "Header"
					},
					"bindTo": "UsrType",
					"enabled": true,
					"contentType": 3
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "LOOKUP2357bd3a-f2d8-4edf-ae79-0d32b3074fca",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 0,
						"layoutName": "Header"
					},
					"bindTo": "UsrOfferType",
					"enabled": true,
					"contentType": 3
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "STRING6a1e33c8-c6a0-4db2-bca1-b5593b71eaa4",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 1,
						"layoutName": "Header"
					},
					"bindTo": "UsrComment",
					"enabled": true,
					"contentType": 0
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "LOOKUP691d32ed-8eef-4d96-a3bc-cfe4d07c99d9",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 2,
						"layoutName": "Header"
					},
					"bindTo": "UsrLandlord",
					"enabled": true,
					"contentType": 5
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "Tab899d75edTabLabel",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.Tab899d75edTabLabelTabCaption"
					},
					"items": [],
					"order": 0
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrRealtyVisitDetail",
				"values": {
					"itemType": 2,
					"markerValue": "added-detail"
				},
				"parentName": "Tab899d75edTabLabel",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "NotesAndFilesTab",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.NotesAndFilesTabCaption"
					},
					"items": [],
					"order": 1
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "Files",
				"values": {
					"itemType": 2
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "NotesControlGroup",
				"values": {
					"itemType": 15,
					"caption": {
						"bindTo": "Resources.Strings.NotesGroupCaption"
					},
					"items": []
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "Notes",
				"values": {
					"bindTo": "UsrNotes",
					"dataValueType": 1,
					"contentType": 4,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 24
					},
					"labelConfig": {
						"visible": false
					},
					"controlConfig": {
						"imageLoaded": {
							"bindTo": "insertImagesToNotes"
						},
						"images": {
							"bindTo": "NotesImagesCollection"
						}
					}
				},
				"parentName": "NotesControlGroup",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "merge",
				"name": "ESNTab",
				"values": {
					"order": 2
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
