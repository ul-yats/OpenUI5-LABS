/*global location*/
sap.ui.define([
		"zjblessons/Worklist/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zjblessons/Worklist/model/formatter"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter
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
					});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				iOriginalBusyDelay = this.getView().setBusyIndicatorDelay(0).getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
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

			onPressEditMaterial: function(){
				this._setEditMode(true);
			},
			
			onPressCancelEditMaterial: function(){
				this.getModel().resetChanges();
				this._setEditMode(false);
			},
			
			onPressSaveEditMaterial: function(){
				this.getModel().submitChanges();
				this._setEditMode(false);
			},
			
			_setEditMode: function(bMode){
				this.getModel("objectView").setProperty("/editMode", bMode);
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
			}

		});

	}
);