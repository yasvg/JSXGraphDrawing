var GraphMain = function () {
    "use strict";
    //	this.valueArray = new Array();
    //	this.frequncyArray =  new Array();
    //	this.operationArray= new Array();
    //	this.min = 0;
    //	this.max= 0;
    //	this.mean = 0;
    //	this.average=0;

    //	this.valueHolderInputDiv= "#valueHolder";
    //	this.frequencyHolderDiv= "#frequencyHolder";
    //	this.percentile_dropDown = "#dropdn_percentile";
    //	this.valuesGrandSum = 0;
    //	this.frequencyGrandSum =0;
    //	this.pth_percentile =null;

    this.tabSelector = "a[data-toggle='tab']";
    this.activeTabObj = new CreateGraph();
    this.calculateBtn = "#calculate_btn";

    // On Render Complete on Board the Bind Events is Attached.
    this.bindEvents();
};

GraphMain.prototype = {
    bindEvents: function () {
        var self = this;

        $(self.tabSelector).off('shown.bs.tab').on('shown.bs.tab', function (event) {
            console.log("current tab ", event.target);
            console.log("previous tab ", event.relatedTarget);
            var tabName = $(event.target).data("name");
            console.log(tabName);

           	if (tabName === "creategraph") {
                self.activeTabObj = new CreateGraph();
            }
        });

//        $(self.calculateBtn).off('click').on('click', function (event) {
//            self.activeTabObj.calculate();
//        });
    }
};

$(function () {
    //creating action object.
    var actionObj = new GraphMain();

    //assiging to globle object for Dev Purpose
    GObj = actionObj;
});

//for dev purpose defining global variable
var GObj = null;