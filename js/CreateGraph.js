var CreateGraph = function () {

    this.MINIMUM_DISTANCE_FOR_LINE = 30;
	this.jsxboard = "#graph_div";
	this.jsxboardId = "graph_div";
	this.isMouseDown = false;
	this.firstCoords = [];
	this.newCoords = [];
	this.pointsArr = [];
	this.currentLine = null;
    this.nearestFirstPoint = null;
    this.nearestLastPoint = null;
    this.isDragging = false;
//    this.isFirstPointNewMouseDown = true;
//    this.isFirstPointNewMouseUp = true;
	this.linesArr = [];
    this.resetButton = "#resetBtn";
    this.commandsRadios = "[name=commands]";
    this.commandsSelectedRadio = "[name=commands]:checked";
    this.addVerticesRadioId = "add_vertices";
    this.moveVerticesRadioId = "move_vertices";
    this.doDrawing = true;
    this.config = null;
	this.initBoard();
	this.initEvents();
    this.loadConfig();
};

CreateGraph.prototype = {
	initBoard: function () {
		var self = this;
		self.board = JXG.JSXGraph.initBoard(self.jsxboardId, {
			boundingbox: [-10, 10, 10, -10],
            showCopyright:false
		});
	},
	initEvents: function () {
		var self = this;
		//initBoardEvents on page load
		self.bindBoardEventsVxAdd();
        $(self.commandsRadios).off("click").on("click", function(){
			if($(self.commandsSelectedRadio).attr("id") === self.moveVerticesRadioId){
                self.bindBoardEventsVxMove();
                self.doDrawing = false;
            } else {
                self.bindBoardEventsVxAdd();
                self.doDrawing = true;
            }
            
            for(el in self.board.objects) {
                var obj = self.board.objects[el];
                if(JXG.isPoint(obj)){
                    //console.log("element is point", obj);
                    obj.setAttribute({fixed: self.doDrawing});
                }
            }
        });
        $(self.resetButton).off("click").on("click", {self:self}, self.resetGraph);
	},
    loadConfig: function(){
        self = this;
        $.ajax({
            url: "json/config.json",
            dataType: "JSON",
            success: function(data){
                console.log("data", data);
                self.config = data;
            },
            error: function(a, b, c){
                console.log("a, b, c",a, b, c);
            }
        });
    },
    bindBoardEventsVxAdd: function(){
        var self = this;
        $(self.jsxboard).off("mousedown").on("mousedown", {
			self: self
		}, self.handleMouseDownVxAdd);
		$(self.jsxboard).off("mouseup").on("mouseup", {
			self: self
		}, self.handleMouseUpVxAdd);
		$(self.jsxboard).off("mousemove").on("mousemove", {
			self: self
		}, self.handleMouseMoveVxAdd);
    },
	bindBoardEventsVxMove: function(){
        var self = this;
        $(self.jsxboard).off("mousedown").on("mousedown", {
			self: self
		}, self.handleMouseDownVxMove);
		$(self.jsxboard).off("mouseup").on("mouseup", {
			self: self
		}, self.handleMouseUpVxMove);
		$(self.jsxboard).off("mousemove").on("mousemove", {
			self: self
		}, self.handleMouseMoveVxMove);
    },
	handleMouseDownVxMove: function(event){
		var self = event.data.self;
		console.log("handleMouseDownVxMove");
        var coords = self.getMouseCoords(event);
        for(el in self.board.objects) {
            var obj = self.board.objects[el];
            if(JXG.isPoint(obj) && obj.hasPoint(coords.scrCoords[1], coords.scrCoords[2])){
                //console.log("element is point", obj);
                self.nearestFirstPoint = obj;
            }
        }
        
        
	},
	handleMouseUpVxMove: function(event){
		var self = event.data.self;
		console.log("handleMouseUpVxMove");
        var coords = self.getMouseCoords(event);
        console.log("self.nearestFirstPoint", self.nearestFirstPoint);
        for(el in self.board.objects) {
            var obj = self.board.objects[el];
            if(self.nearestFirstPoint !== obj && JXG.isPoint(obj) && obj.hasPoint(coords.scrCoords[1], coords.scrCoords[2])){
                //console.log("element is point", obj);
                //self.nearestLastPoint = obj;
                //console.log("nearest last point", obj);
                if(obj.name !== ""){
                    self.nearestLastPoint = obj;
                }
            }
        }
        
        if(self.nearestLastPoint !== null){
            console.log("self.nearestLastPoint", self.nearestLastPoint);
            var draggingLines = self.getLines(self.nearestFirstPoint);
            var targetLines = self.getLines(self.nearestLastPoint);
            
            console.log("draggingLines", draggingLines);
            console.log("targetLines", targetLines);
            
            //remove from array
            console.log("remove first point from array");
            self.pointsArr.splice(self.pointsArr.indexOf(self.nearestFirstPoint), 1);

            //set position of dragging point, i.e., nearestFirstPoint to last point
            console.log("setting position");
//            self.nearestFirstPoint.setPosition(JXG.COORDS_BY_USER,[self.nearestLastPoint.coords.usrCoords[1],self.nearestLastPoint.coords.usrCoords[2]]);
            
            for(var i=0; i<draggingLines.length; i++){
                var line = draggingLines[i];
                if(line.point1 === self.nearestFirstPoint){
                    line.point1 = self.nearestLastPoint;;
//                    line.point1.setPosition(JXG.COORDS_BY_USER,[self.nearestLastPoint.coords.usrCoords[1],self.nearestLastPoint.coords.usrCoords[2]]);
                } else if(line.point2 === self.nearestFirstPoint){
                    line.point2 = self.nearestLastPoint;
//                    line.point2.setPosition(JXG.COORDS_BY_USER,[self.nearestLastPoint.coords.usrCoords[1],self.nearestLastPoint.coords.usrCoords[2]]);
                }
            }
            
            if(self.nearestFirstPoint.name !== ""){
                console.log("removing first point from board and array");
                //remove first point from board and array
                self.board.removeObject(self.nearestFirstPoint);
                self.pointsArr.splice(self.pointsArr.indexOf(self.nearestFirstPoint), 1);
            }
        }
        
        self.board.update();
        
        self.nearestFirstPoint = null;
        self.nearestLastPoint = null;
	},
	handleMouseMoveVxMove: function(event){
		var self = event.data.self;
		//console.log("handleMouseMoveVxMove");
	},
	handleMouseDownVxAdd: function (event) {
		var self = event.data.self;
        if(self.doDrawing === false){
            return;
        }
        
        //initialize all variables
        self.nearestFirstPoint = null;
        self.nearestLastPoint = null;
        self.firstCoords = null;
        self.newCoords = null;
        self.currentLine = null;
        self.isDragging = false;
        
		self.isMouseDown = true;
        this.isDragging = false;
		self.firstCoords = self.getMouseCoords(event);
        
        self.currentLine = self.board.create('line',[[self.firstCoords.usrCoords[1],self.firstCoords.usrCoords[2]],[self.firstCoords.usrCoords[1],self.firstCoords.usrCoords[2]]], {straightFirst:false, straightLast:false,strokeColor:self.config.edgeColor,strokeWidth:self.config.edgeWidth});
        
	},
    handleMouseUpVxAdd: function (event) {
		var self = event.data.self;
        if(self.doDrawing === false){
            return;
        }
		self.isMouseDown = false;
        var wasDragging = this.isDragging;
        
        self.checkPointOne();
        self.checkPointTwo();
        
        //console.log("self.nearestFirstPoint", self.nearestFirstPoint);
        //console.log("self.nearestLastPoint", self.nearestLastPoint);
        
        var currentLineLength = self.getDistanceBetweenCoords(self.firstCoords.scrCoords, self.newCoords.scrCoords);
        if(currentLineLength < self.MINIMUM_DISTANCE_FOR_LINE){
            if(self.currentLine.point1 !== self.nearestFirstPoint){
                self.board.removeObject(self.currentLine.point1);
            }
            if(self.currentLine.point2 !== self.nearestLastPoint){
                self.board.removeObject(self.currentLine.point2);
            }
            self.board.removeObject(self.currentLine);
        } else {
            self.p1 = self.board.create('point',[self.firstCoords.usrCoords[1],self.firstCoords.usrCoords[2]], {fixed: true, size:self.config.vertexSize, fillColor: self.config.vertexColor, strokeColor: self.config.vertexColor});
            self.pointsArr.push(self.p1);
            self.currentLine.point1 = self.p1;
            
            self.p2 = self.board.create('point',[self.newCoords.usrCoords[1],self.newCoords.usrCoords[2]], {fixed: true, size:self.config.vertexSize, fillColor: self.config.vertexColor, strokeColor: self.config.vertexColor});
            self.pointsArr.push(self.p2);
            self.currentLine.point2 = self.p2;
            
            if(self.nearestFirstPoint !== null && self.nearestLastPoint !== null && self.linesArr.length > 1){
                var point1 = self.currentLine.point1;
                var point2 = self.currentLine.point2;
                self.currentLine.point1 = self.nearestFirstPoint;
                self.currentLine.point2 = self.nearestLastPoint;
                self.board.removeObject(point1);
                self.board.removeObject(point2);
                
                //remove the points from array
                self.pointsArr.splice(self.pointsArr.indexOf(point1), 1);
                self.pointsArr.splice(self.pointsArr.indexOf(point2), 1);
            } else if(self.nearestFirstPoint !== null){
                var dist = self.getDistanceBetweenCoords(self.nearestFirstPoint.initialCoords.scrCoords, self.firstCoords.scrCoords);
                
                if(dist < self.MINIMUM_DISTANCE_FOR_LINE){
                    var point1 = self.currentLine.point1;
                    self.currentLine.point1 = self.nearestFirstPoint;
                    self.board.removeObject(point1);
                    self.currentLine.point2.setAttribute({name: point1.name});
                    //remove the point from array
                    self.pointsArr.splice(self.pointsArr.indexOf(point1), 1);
                }
            } else if(self.nearestLastPoint !== null){
                var dist = self.getDistanceBetweenCoords(self.nearestLastPoint.initialCoords.scrCoords, self.newCoords.scrCoords);
                
                if(dist < self.MINIMUM_DISTANCE_FOR_LINE){
                    var point2 = self.currentLine.point2;
                    self.currentLine.point2 = self.nearestLastPoint;
                    self.board.removeObject(point2);
                    //self.currentLine.point2.setAttribute({name: point1.name});
                    //remove the point from array
                    self.pointsArr.splice(self.pointsArr.indexOf(point2), 1);
                }
            }
        }
        
        self.board.update();
        
        self.linesArr.push(self.currentLine);
        
        self.nearestFirstPoint = null;
        self.nearestLastPoint = null;
        self.firstCoords = null;
        self.newCoords = null;
        self.currentLine = null;
        self.isDragging = false;
	}, 
	handleMouseMoveVxAdd: function (event) {
		var self = event.data.self;
        if(self.doDrawing === false){
            return;
        }
        
        self.isDragging = true;
                
		self.newCoords = self.getMouseCoords(event);
        //console.log("new coords", self.newCoords);
		if(self.isMouseDown === true){
            //self.checkPointOne();
			self.updateLine(event);
		}
	},
    checkPointOne: function(){
        var self = this;
        var refCoords = self.firstCoords;
        var minDist = null;
        var minDistPoint = null;
        self.nearestFirstPoint = null;
        //assign minimum distance to distance from first point in array
        if(self.pointsArr.length > 0){
            minDist = self.getDistanceBetweenCoords(self.pointsArr[0].initialCoords.scrCoords, refCoords.scrCoords);
            minDistPoint = self.pointsArr[0];
        }
        
        //console.log("initial minDist", minDist);
        //console.log("initial minDistPoint", minDistPoint);
        
        for(var i=0; i < self.pointsArr.length; i++){
            //console.log("self.pointsArr[i]", self.pointsArr[i]);
            var coord = self.pointsArr[i].initialCoords.scrCoords;
            var dist = self.getDistanceBetweenCoords(coord, refCoords.scrCoords);
            //console.log("dist", dist);
            
            if(dist < minDist){
                //console.log("changing minimum distance, i", i);
                minDist = dist;
                minDistPoint = self.pointsArr[i];
            }
        }
        
        //console.log("minDist after for loop", minDist);
        //console.log("minDistPoint after for loop", minDistPoint);
        
        if(minDist < self.MINIMUM_DISTANCE_FOR_LINE && minDistPoint !== null){
            self.p1 = minDistPoint;
            self.currentLine.point1 = minDistPoint;
            self.nearestFirstPoint = minDistPoint;
        }
        
        self.board.update();
    },
    checkPointTwo: function(){
        var self = this;
        var refCoords = self.newCoords;
        var minDist = null;
        var minDistPoint = null;
        self.nearestLastPoint = null;
        //assign minimum distance to distance from first point in array
        if(self.pointsArr.length > 0){
            minDist = self.getDistanceBetweenCoords(self.pointsArr[0].initialCoords.scrCoords, refCoords.scrCoords);
            minDistPoint = self.pointsArr[0];
        }
        
        //console.log("initial minDist", minDist);
        //console.log("initial minDistPoint", minDistPoint);
        
        for(var i=0; i < self.pointsArr.length; i++){
            //console.log("self.pointsArr[i]", self.pointsArr[i]);
            var coord = self.pointsArr[i].initialCoords.scrCoords;
            var dist = self.getDistanceBetweenCoords(coord, refCoords.scrCoords);
            //console.log("dist", dist);
            
            if(dist < minDist){
                //console.log("changing minimum distance, i", i);
                minDist = dist;
                minDistPoint = self.pointsArr[i];
            }
        }
        
        //console.log("minDist after for loop", minDist);
        //console.log("minDistPoint after for loop", minDistPoint);
        
        if(minDist < self.MINIMUM_DISTANCE_FOR_LINE && minDistPoint !== null){
            self.p2 = minDistPoint;
            self.currentLine.point2 = minDistPoint;
            self.nearestLastPoint = minDistPoint;
        }
        
        self.board.update();
    },
	getMouseCoords: function (e) {
		var self = this;
		var i = 0;
		var cPos = self.board.getCoordsTopLeftCorner(e, i),
			absPos = JXG.getPosition(e, i),
			dx = absPos[0] - cPos[0],
			dy = absPos[1] - cPos[1];

		return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], self.board);
	},
	getDistanceBetweenCoords: function(coord1, coord2){
		//console.log("coord1", coord1);
        //console.log("coord2", coord2);
		var x1 = coord1[1];
		var y1 = coord1[2];
		var x2 = coord2[1];
		var y2 = coord2[2];
		var dist = Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2));
		
		//console.log("dist", dist);
		return dist;
	},
    getLines: function(point){
        var self = this;
        var returnArray = [];
        var coords = point.coords.scrCoords;
        for(var i=0; i<self.linesArr.length; i++){
            var line = self.linesArr[i];
            if(line.hasPoint(coords[1], coords[2])){
                returnArray.push(line);
            }
        }
        
        return returnArray;
    },
	updateLine: function(event){
		var self = this;
		//console.log(self);
		//self.newCoords = self.getMouseCoords(event);
        var dist = self.getDistanceBetweenCoords(self.newCoords.scrCoords, self.firstCoords.scrCoords);
        //console.log("after dist calculation");
        if(dist >= self.MINIMUM_DISTANCE_FOR_LINE){
            self.currentLine.point2.setPosition(JXG.COORDS_BY_USER,[self.newCoords.usrCoords[1],self.newCoords.usrCoords[2]]);
        }
        //console.log("before board update");
		self.board.update();
	},
    resetGraph: function(event){
        var self = event.data.self;
        for(el in self.board.objects) {
         self.board.removeObject(self.board.objects[el]);
        }
        
        self.isMouseDown = false;
        self.firstCoords = [];
        self.newCoords = [];
        self.pointsArr = [];
        self.currentLine = null;
        self.nearestFirstPoint = null;
        self.nearestLastPoint = null;
        self.isDragging = false;
        self.linesArr = [];
        self.doDrawing = ($(self.commandsSelectedRadio).attr("id") !== self.moveVerticesRadioId);
    }
};
