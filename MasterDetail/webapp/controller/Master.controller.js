/*global history */
sap.ui.define([
		"zjblessons/MasterDetail/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/GroupHeaderListItem",
		"sap/ui/Device",
		"zjblessons/MasterDetail/model/formatter"
	], function (BaseController, JSONModel, Filter, FilterOperator, GroupHeaderListItem, Device, formatter) {
		"use strict";

		return BaseController.extend("zjblessons.MasterDetail.controller.Master", {

			formatter: formatter,
			onInit : function () {
				var oList = this.byId("list"),
					oViewModel = this._createViewModel(),
					iOriginalBusyDelay = oList.getBusyIndicatorDelay();


				this._oList = oList;
				this._oListFilterState = {
					aFilter : [],
					aSearch : []
				};

				this.setModel(oViewModel, 'masterView');

				this.getRouter().getRoute("object").attachPatternMatched(this._onMasterMatched, this);
				this.getRouter().attachBypassed(this.onBypassed, this);
			},

			onUpdateFinished : function (oEvent) {

				this._updateListItemCount(oEvent.getParameter("total"));

				this.byId("pullToRefresh").hide();
			},


			onSelectionChange : function (oEvent) {
				this._showDetail(oEvent.getParameter("listItem"));
			},



			onBypassed : function () {
				this._oList.removeSelections(true);
			},


			_createViewModel : function() {
				return new JSONModel({
					isFilterBarVisible: false,
					filterBarLabel: "",
					delay: 0,
					title: this.getResourceBundle().getText("masterTitleCount", [0]),
					noDataText: this.getResourceBundle().getText("masterListNoDataText"),
					sortBy: "CreatedByFullName",
					groupBy: "None"
				});
			},


			_onMasterMatched :  function(oEvent) {
				const sEntity = oEvent.getParameter('arguments').entity;
				this.byId('list').getItems().forEach((oItem) => {
					if(oItem.getCustomData()[0].getKey() === sEntity){
						oItem.setSelected(true);
					}
				})
			},


			_showDetail : function (oItem) {
				this.getRouter().navTo("object", {
					entity : oItem.getCustomData()[0].getKey()
				});
			},


			_updateListItemCount : function (iTotalItems) {
				var sTitle;
				// only update the counter if the length is final
				if (this._oList.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
					this.getModel("masterView").setProperty("/title", sTitle);
				}
			},


			_applyFilterSearch : function () {
				var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
					oViewModel = this.getModel("masterView");
				this._oList.getBinding("items").filter(aFilters, "Application");

				if (aFilters.length !== 0) {
					oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
				} else if (this._oListFilterState.aSearch.length > 0) {

					oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
				}
			},


			_applyGroupSort : function (aSorters) {
				this._oList.getBinding("items").sort(aSorters);
			},

			
			_updateFilterBar : function (sFilterBarText) {
				var oViewModel = this.getModel("masterView");
				oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
				oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
			}

		});

	}
);