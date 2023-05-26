/*global location history */
sap.ui.define([
		"zjblessons/Worklist/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/Worklist/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment) {
		"use strict";

		return BaseController.extend("zjblessons.Worklist.controller.Worklist", {

			formatter: formatter,
			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");
					
				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();

				this._aTableSearchState = [];

				oViewModel = new JSONModel({
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "worklistView");

				this.getRouter().getRoute('worklist').attachPatternMatched(this._onObjectMatched, this);

				oTable.attachEventOnce("updateFinished", function(){
					
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
			},

			onUpdateFinished : function (oEvent) {

				var sTitle,
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");

				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			},

			
			onPress : function (oEvent) {
				this._showObject(oEvent.getSource());
			},
			
			_onObjectMatched: function() {
				this.getModel().resetChanges();
			},

			_loadCreateMateriaFragment: function(oEntryContext){
				if(!this.oCreateDialog){
					this.pCreateMaterial = Fragment.load({
						name:"zjblessons.Worklist.view.Fragment.CreateMaterial",
						controller: this,
						id:"fCreateDialog"
					}).then(oDialog => {
						this.oCreateDialog = oDialog;
						this.getView().addDependent(this.oCreateDialog);
						return Promise.resolve(oDialog);
					});
				}
				this.pCreateMaterial.then(oDialog => {
					oDialog.setBindingContext(oEntryContext);
					oDialog.open();
				});
			},
			
			onPressCreateMaterial: function() {
				const mProps = {
					Language: "RU",
					Version: "A" ,
					MaterialID:"0"
				};
				
				const oEntryContext=this.getModel().createEntry('/zjblessons_base_Materials', {
					properties: mProps
				});
				
				this._loadCreateMateriaFragment(oEntryContext);
			},
			
			_closeCreateDialog: function(dialog){
				dialog.close();
			},
			
			onPressCloseCreateDialog: function(){
				this.getModel().resetChanges();
				this._closeCreateDialog(this.oCreateDialog);
			},
			
			onPressSaveCreateMaterial: function(){
				this.getModel().submitChanges();
				this._closeCreateDialog(this.oCreateDialog);
			},
			
			onPressDeleteEntry: function(oEvent){
				this.sEntryPath = oEvent.getSource().getBindingContext().getPath();
				sap.m.MessageBox.confirm(this.getResourceBundle().getText('msgdeletionConfiramtion'),{
					actions:[
							sap.m.MessageBox.Action.OK,
							sap.m.MessageBox.Action.CANCEL
						],
					emphasizedAction: sap.m.MessageBox.Action.OK,
					initialFocus: null,
					onClose: function(sAction){
						if(sAction === 'OK'){
							this.getModel().remove(this.sEntryPath);
						}
					}.bind(this)
				});
			},

			onNavBack : function() {
				history.go(-1);
			},


			onSearchMaterialText : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					this.onRefresh();
				} else {
					var aTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("MaterialText", FilterOperator.EQ, sQuery)];
					}
					this._applySearch(aTableSearchState);
				}

			},
			
			
			onSearhCreatedByFullName: function(oEvent) {
				if(oEvent.getParameters().refreshButtonPressed){
					this.onRefresh();
				} else {
					let aTableSearchState = [];
					let sQuery = oEvent.getParameter('query');
					if(sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter('CreatedByFullName', FilterOperator.Contains, sQuery)];              
					}
					this._applySearch(aTableSearchState);
				}
			},
			
			onRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},
			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("MaterialID")
				});
			},

			_applySearch: function(aTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(aTableSearchState, "Application");

				if (aTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
			}

		});
	}
);