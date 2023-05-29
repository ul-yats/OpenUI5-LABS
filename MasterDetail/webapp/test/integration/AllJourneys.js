/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 jbcommon_auth_ModifiedBy in the list

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
		"zgblessons/MasterDetail/test/integration/MasterJourney",
		"zgblessons/MasterDetail/test/integration/NavigationJourney",
		"zgblessons/MasterDetail/test/integration/NotFoundJourney",
		"zgblessons/MasterDetail/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});