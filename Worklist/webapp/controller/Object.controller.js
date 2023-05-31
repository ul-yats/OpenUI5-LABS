/*global location*/
sap.ui.define([
		"zjblessons/Worklist/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zjblessons/Worklist/model/formatter",
		"sap/ui/core/Fragment",
		"sap/ui/core/Item",
	], function (
		BaseController,
	JSONModel,
	History,
	formatter,
	Fragment,
	Item,
	) {
		"use strict";

		return BaseController.extend("zjblessons.Worklist.controller.Object", {

			formatter: formatter,
			onInit : function () {
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0,
						editMode: false,
						selectedKeyITB: 'list',
						validateError: false,
					});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				iOriginalBusyDelay = this.getView().setBusyIndicatorDelay(0).getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
				this.fListEdit = this.byId('listTab').data('aValidateErrors', []);
			},

			onNavBack : function() {
				const sPreviousHash = History.getInstance().getPreviousHash();
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", {}, true);
				}
				this.onPressCancelEditMaterial();
			},

			onChange: function(oEvent){
				const bState = oEvent.getParameter('state');
				!bState && this._validateSaveMaterial()
				if(!bState && this.getModel().hasPendingChanges() || this.getModel('objectView').getProperty('/validateError')){
					sap.m.MessageBox.confirm(this.getResourceBundle().getText('ttlSaveChanges'),{
						title: this.getResourceBundle().getText('ttlChooseAction'),
						actions:[
							sap.m.MessageBox.Action.OK,
							sap.m.MessageBox.Action.CANCEL,
							sap.m.MessageBox.Action.CLOSE,
						],
						emphasizedAction: sap.m.MessageBox.Action.OK,
						textDirection: sap.ui.core.TextDirection.Inherit,  
						initialFocus: null,
						onClose:(sAction) => {
							if(sAction === 'OK'){
								this.onPressSaveEditMaterial()
							} else if (sAction==='CANCEL'){
								this.onPressCancelEditMaterial()
							}
						}
					});
					this._setEditMode(true);
				} 
				else{
					this._setEditMode(bState);
				}
			},

			onPressEditMaterial: function(){
				this._setEditMode(true);
			},
			
			onPressCancelEditMaterial: function(){
				this._clearValidateErrors()
				this.getModel('objectView').setProperty('/validateError', false)
				this.getModel().resetChanges();
				this._setEditMode(false);
			},

			onPressSaveEditMaterial: function(){
				this._validateSaveMaterial()
				if(!this.getModel('objectView').getProperty('/validateError')){
					if(this.getModel().hasPendingChanges()){
						this.getModel().submitChanges({
							success: function() {
								sap.m.MessageToast.show('Record successfully changed!',{
									duration: 1000,
									animationTimingFunction: "ease",
									animationDuration: 1000, 
								})
							},
							error: function(oError){
								sap.m.MessageToast.show('Error!',{
									duration: 1000,
									animationTimingFunction: "ease",
									animationDuration: 1000, 
								})
							},
						});
					}
					this._setEditMode(false);
				}
			},

			_onObjectMatched : function (oEvent) {
				this._setEditMode(false)
				const sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					const sObjectPath = this.getModel().createKey("zjblessons_base_Materials", {
						MaterialID :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));
			},

			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel();

				this.getView().bindElement({
					path: sObjectPath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding();

				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				var oResourceBundle = this.getResourceBundle(),
					oObject = oView.getBindingContext().getObject(),
					sObjectId = oObject.MaterialID,
					sObjectName = oObject.CreatedBy;

				oViewModel.setProperty("/busy", false);
			},

			_setEditMode: function(bMode){
				this.getModel("objectView").setProperty("/editMode", bMode);
				const sSelectedKey = this.getModel('objectView').getProperty("/selectedKeyITB");

				if(bMode && sSelectedKey==='list'){
					this._bindSelectGroup();
					this._bindSubSelectGroup();
				}

				if(sSelectedKey==='form'){
					this._addFormContent(bMode ? "Edit" : "View");
				}
			},

			onSelectIconTabBar: function(oEvent){
				const sSelectedKey = oEvent.getSource().getSelectedKey();
				this.getModel("objectView").setProperty("/selectedKeyITB", sSelectedKey);

				if(sSelectedKey !== 'form') return;

				this._addFormContent('View');
			},

			_bindSelectGroup: function (){
				this.byId("SelectGroup").bindItems({
					path: "/zjblessons_base_Groups",
					template: new sap.ui.core.Item({
						key: "{GroupID}",
						text: "{GroupText}",
					}),
					sorter: new sap.ui.model.Sorter("GroupText", true),
					filters: new sap.ui.model.Filter("GroupText", sap.ui.model.FilterOperator.NE, null)
				})
			},

			_bindSubSelectGroup: function(){
				this._getSubGroupSelectTemplate().then(oTemplate => {
					this.byId('SelectSubGroup').bindItems({
						path: '/zjblessons_base_SubGroups',
						template: oTemplate,
						sorter: new sap.ui.model.Sorter("SubGroupText", true),
					})
				})
			},

			_addFormContent(sMode){
				if(!this[`pForm${sMode}`]){
					this[`pForm${sMode}`]=Fragment.load({
						name:"zjblessons.Worklist.view.Fragment.Form"+sMode,
						controller: this,
						id: this.getView().getId(),
					}).then((oContent) => {
						this.fFormEditView = oContent;
						this.getView().addDependent(this.fFormEditView);
						return oContent;
					})
				}

				this[`pForm${sMode}`].then((oContent) => {
					const IconTabFilter = this.byId('FormIconTabFilter');
					this.fFormEditView.data('aValidateErrors', [])
					IconTabFilter.removeAllContent();
					IconTabFilter.insertContent(oContent, 0);
				})
			},

			_getSubGroupSelectTemplate: function() {
				return new Promise((resolve, reject) => {
					if(!this.pSubGroupSelectTemplate){
						this.pSubGroupSelectTemplate = Fragment.load({
							name: "zjblessons.Worklist.view.Fragment.SubGroupSelectTemplate",
							controller: this,
							id: this.getView().getId(),
						}).then(oTemplate => oTemplate)
					}

					this.pSubGroupSelectTemplate.then(oTemplate => {
						resolve(oTemplate);
					}).catch(oError => {
						MessageBox.error(oError.toString());
						reject();
					})
				})
			},

			validateFieldGroupMaterial: function(oEvent){
				const oSource = oEvent.getSource();
				const selectedKeyITB = this.getModel('objectView').getProperty('/selectedKeyITB');
				const aValidateErrors = selectedKeyITB === 'list' ? this.fListEdit.data('aValidateErrors') : this.fFormEditView.data('aValidateErrors');
				let bSuccess = true;
				let sErrorText;
				switch(oSource.getProperty('fieldGroupIds')[0]){
					case selectedKeyITB === 'list' ? 'listInput' : 'formInput' :
						bSuccess = !!oSource.getValue()
						sErrorText = this.getResourceBundle().getText('ttlInputError');
						break;
					case selectedKeyITB === 'list' ? 'listSelect' : 'formSelect' :
						bSuccess = !!oSource.getSelectedItem()
						sErrorText = sErrorText = this.getResourceBundle().getText('ttlSelectError');
						break;
					case selectedKeyITB === 'list' ? 'listInputRating' : 'formInputRating':
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
					if(aValidateErrors.indexOf(oSource) === -1) return;
					aValidateErrors.splice(aValidateErrors.indexOf(oSource), 1)
				} else {
					if(aValidateErrors.indexOf(oSource) === -1){
						aValidateErrors.push(oSource);
					}
				}

				this.getModel("objectView").setProperty('/validateError', !!aValidateErrors.length)
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

			_validateSaveMaterial: function(){
				const fieldIds = this.getView().getControlsByFieldGroupId();
				fieldIds.forEach((oItem) => {
					if(oItem.mProperties.fieldGroupIds[0]){
						oItem.fireValidateFieldGroup()
					}
				})
			}
		});
	}
);