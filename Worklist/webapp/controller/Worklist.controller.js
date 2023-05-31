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
					tableBusyDelay : 0,
					validateError: false,
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
					oDialog.data('errors',[])
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
					properties: mProps,
				});
				
				this._loadCreateMateriaFragment(oEntryContext);
			},
			
			_closeCreateDialog: function(dialog){
				dialog.close();
			},
			
			onPressCloseCreateDialog: function(){
				this._clearValidateErrors()
				this.getModel().resetChanges();
				this._closeCreateDialog(this.oCreateDialog);
			},
			
			onPressSaveCreateMaterial: function(){
				this._validateSaveMaterial();
				if(!this.getModel("worklistView").getProperty('/validateError')){
					this.getModel().submitChanges();
					this._closeCreateDialog(this.oCreateDialog);
				}
			},

			_validateSaveMaterial: function() {
				const fieldIds = this.getView().getControlsByFieldGroupId();
				fieldIds.forEach((oItem) => {
					if(oItem.mProperties.fieldGroupIds[0]){
						oItem.fireValidateFieldGroup()
					}
				})
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
				const sValue = oEvent.getParameter('query') || oEvent.getParameter('newValue');
				const aFilters = [];
				if(sValue){
					aFilters.push(
						new Filter({
							filters: [
								new Filter('MaterialText', FilterOperator.Contains, sValue),
								new Filter('MaterialDescription', FilterOperator.Contains, sValue),

								new Filter({
									filters: [
										new Filter('CreatedByFullName', FilterOperator.Contains, sValue),
										new Filter('ModifiedByFullName', FilterOperator.Contains, sValue)
									],
									and: true
								})
							],
							and: false
						})
					)
				};
				this.byId('table').getBinding('items').filter(aFilters);
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
			},
			

			validateFieldGroupMaterial: function(oEvent){
				const oSource = oEvent.getSource();
				const aErrors = this.oCreateDialog.data('errors');
				let bSuccess = true;
				let sErrorText;
				switch(oSource.getProperty('fieldGroupIds')[0]){
					case 'input':
						bSuccess = !!oSource.getValue()
						sErrorText = this.getResourceBundle().getText('ttlInputError');
						break;
					case 'comboBox':
						bSuccess = oSource.getItems().includes(oSource.getSelectedItem())
						sErrorText = this.getResourceBundle().getText('ttlSelectError');
						break;
					case 'inputRating':
							const pattern = /^[0-9]\.\d{1,2}$/;
							if(oSource.getValue()){
								bSuccess = pattern.test(oSource.getValue());
								sErrorText = sErrorText = this.getResourceBundle().getText('ttlInputRatingError');
							} else {
								bSuccess = !!oSource.getValue()
								sErrorText = this.getResourceBundle().getText('ttlInputError');
							}
						break
				}
				oSource.setValueState(bSuccess ? 'None': 'Error');
				oSource.setValueStateText(sErrorText);

				if(bSuccess){
					if(aErrors.indexOf(oSource) === -1) return;
					aErrors.splice(aErrors.indexOf(oSource), 1)
				} else {
					if(aErrors.indexOf(oSource) === -1){
						aErrors.push(oSource);
					}
				}

				this.getModel("worklistView").setProperty('/validateError', !!aErrors.length)
			},

			_clearValidateErrors: function(){
				const fieldIds = this.getView().getControlsByFieldGroupId();
				fieldIds.forEach((oItem) => {
					if(oItem.mProperties.fieldGroupIds[0]){
						oItem.setValueState('None');
						oItem.setValueStateText('');
					}
				})
			},
		});
	}
);