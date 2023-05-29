/*global location */
sap.ui.define([
		"zjblessons/MasterDetail/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/MasterDetail/model/formatter",
	"sap/m/Table",
	"sap/m/VBox",
	"sap/m/Panel",
	"sap/ui/table/Table",
	"sap/m/Label"
	], function (BaseController, JSONModel, formatter) {
		"use strict";

		return BaseController.extend("zjblessons.MasterDetail.controller.Detail", {

			formatter: formatter,

			_oViewModel: new JSONModel({
				masterItem: "",
				count: "",
				panelsCount: {
					Groups: '',
					SubGroups: '',
					Regions: '',
					Plants: '',
				}
			}),

			onInit : function () {

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
				this.setModel(this._oViewModel, "detailView")
			},


			_onObjectMatched : function (oEvent) {
				const sEntity = oEvent.getParameter('arguments').entity;

				this.getModel('detailView').setProperty('/masterItem', sEntity);

				switch(sEntity){
					case "All":
						this._createPanel();
						break;
					default:
						if(this.byId(sEntity).getBinding('rows')){
							this.byId(sEntity).getBinding('rows').refresh();
						} else {
							this.byId(sEntity).bindRows({
								path: "/zjblessons_base_"+sEntity,
								template: new sap.ui.table.Row({}),
								events: {
									dataReceived: this._setCount.bind(this)
								}
							})
						}

				}
			},

			_setCount(oEvent){
				this.getModel('detailView').setProperty('/count', `(${oEvent.getSource().getLength()})`)
			},

			_setPanelsCount(oEvent){
				const sEntity = oEvent.getSource().getPath().replace('/zjblessons_base_', "");
				this.getModel('detailView').setProperty(`/panelsCount/${sEntity}`, `(${oEvent.getSource().getLength()})`);
			},

			_createPanel: function() {
				if(!this.oPanels){
					this.oPanels = new sap.m.VBox({
						visible: "{= (${detailView>/masterItem}) === 'All'}",
						items: [
							new sap.m.Panel({
								expandable: true,
								headerText: "{i18n>ttlGroups}" + "{= ${detailView>/panelsCount/Groups}}",
								content: [
									(this.oGroups = new sap.ui.table.Table({
										columns: [
											new sap.ui.table.Column({
												width: "auto",
												label: new sap.m.Label({
													text: "{i18n>ttlGroupID}"
												}),
												template: new sap.m.Text({
													text: "{GroupID}"
												})
											}),
											new sap.ui.table.Column({
												width: "auto",
												label: new sap.m.Label({
													text: "{i18n>ttlGroupText}"
												}),
												template: new sap.m.Text({
													text: "{GroupText}"
												})
											}),
											new sap.ui.table.Column({
												width: "auto",
												label: new sap.m.Label({
													text: "{i18n>ttlGroupDescription}"
												}),
												template: new sap.m.Text({
													text: "{GroupDescription}"
												})
											})
										]
									}))
								]
							}),
							new sap.m.Panel({
								expandable: true,
								headerText: "{i18n>ttlSubGroups}" + "{= ${detailView>/panelsCount/SubGroups}}",
								content: [
									(this.oSubGroups = new sap.ui.table.Table({
										columns: [
											new sap.ui.table.Column({
												width: "auto",
												label: new sap.m.Label({
													text: "{i18n>ttlSubGroupID}"
												}),
												template: new sap.m.Text({
													text: "{SubGroupID}"
												})
											}),
											new sap.ui.table.Column({
												width: "auto",
												label: new sap.m.Label({
													text: "{i18n>ttlSubGroupText}"
												}),
												template: new sap.m.Text({
													text: "{SubGroupText}"
												})
											}),
											new sap.ui.table.Column({
												width: "auto",
												label: new sap.m.Label({
													text: "{i18n>ttlCreatedBy}"
												}),
												template: new sap.m.Text({
													text: "{CreatedBy}"
												})
											})
										]
									}))
								]
							}),
							new sap.m.Panel({
								expandable: true,
								headerText: "{i18n>ttlRegions}" + "{= ${detailView>/panelsCount/Regions}}",
								content: [
									(this.oRegions = new sap.ui.table.Table({
										columns: [
											new sap.ui.table.Column({
												width: "auto",
												label: new sap.m.Label({
													text: "{i18n>ttlRegionID}"
												}),
												template: new sap.m.Text({
													text: "{RegionID}"
												})
											}),
											new sap.ui.table.Column({
												width: "auto",
												label: new sap.m.Label({
													text: "{i18n>ttlRegionText}"
												}),
												template: new sap.m.Text({
													text: "{RegionText}"
												})
											}),
											new sap.ui.table.Column({
												width: "auto",
												label: new sap.m.Label({
													text: "{i18n>ttlCreatedBy}"
												}),
												template: new sap.m.Text({
													text: "{CreatedBy}"
												})
											})
										]
									}))
								]
							}),
							new sap.m.Panel({
								expandable: true,
								headerText: "{i18n>ttlPlants}" + "{= ${detailView>/panelsCount/Plants}}",
								content: [
									(this.oPlants = new sap.ui.table.Table({
										columns: [
											new sap.ui.table.Column({
												width: "auto",
												label: new sap.m.Label({
													text: "{i18n>ttlPlantID}"
												}),
												template: new sap.m.Text({
													text: "{PlantID}"
												})
											}),
											new sap.ui.table.Column({
												width: "auto",
												label: new sap.m.Label({
													text: "{i18n>ttlPlantText}"
												}),
												template: new sap.m.Text({
													text: "{PlantText}"
												})
											}),
											new sap.ui.table.Column({
												width: "auto",
												label: new sap.m.Label({
													text: "{i18n>ttlCreatedBy}"
												}),
												template: new sap.m.Text({
													text: "{CreatedBy}"
												})
											})
										]
									}))
								]
							})
						]
					});
				}
				this.oGroups.bindRows({
					path: "/zjblessons_base_Groups",
					template: new sap.ui.table.Row({}),
					events: {
						dataReceived: this._setPanelsCount.bind(this)
					}
				})
				this.oSubGroups.bindRows({
					path: "/zjblessons_base_SubGroups",
					template: new sap.ui.table.Row({}),
					events: {
						dataReceived: this._setPanelsCount.bind(this)
					}
				})
				this.oRegions.bindRows({
					path: "/zjblessons_base_Regions",
					template: new sap.ui.table.Row({}),
					events: {
						dataReceived: this._setPanelsCount.bind(this)
					}
				})
				this.oPlants.bindRows({
					path: "/zjblessons_base_Plants",
					template: new sap.ui.table.Row({}),
					events: {
						dataReceived: this._setPanelsCount.bind(this)
					}
				})
				this.byId('VBoxContent').addItem(this.oPanels);
			},

			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("detailView");

				oViewModel.setProperty("/busy", false);

				this.getView().bindElement({
					path : sObjectPath,
					events: {
						change : this._onBindingChange.bind(this),
						dataRequested : function () {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oElementBinding = oView.getElementBinding();

				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("detailObjectNotFound");
					this.getOwnerComponent().oListSelector.clearMasterListSelection();
					return;
				}

				var sPath = oElementBinding.getPath(),
					oResourceBundle = this.getResourceBundle(),
					oObject = oView.getModel().getObject(sPath),
					sObjectId = oObject.HeaderID,
					sObjectName = oObject.CreatedByFullName,
					oViewModel = this.getModel("detailView");

				this.getOwnerComponent().oListSelector.selectAListItem(sPath);

				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},

			_onMetadataLoaded : function () {
				var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
					oViewModel = this.getModel("detailView");
				oViewModel.setProperty("/delay", 0);
				oViewModel.setProperty("/busy", true);
				oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
			}

		});

	}
);