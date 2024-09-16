/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zgblessons/MasterDetail/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zgblessons/MasterDetail/test/integration/pages/App",
	"zgblessons/MasterDetail/test/integration/pages/Browser",
	"zgblessons/MasterDetail/test/integration/pages/Master",
	"zgblessons/MasterDetail/test/integration/pages/Detail",
	"zgblessons/MasterDetail/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zgblessons.MasterDetail.view."
	});

	sap.ui.require([
		"zgblessons/MasterDetail/test/integration/NavigationJourneyPhone",
		"zgblessons/MasterDetail/test/integration/NotFoundJourneyPhone",
		"zgblessons/MasterDetail/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});