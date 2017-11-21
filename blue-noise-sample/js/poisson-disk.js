// 初始化
function PoissonDiskSampler(data, width, height, minDistance, sampleFrequency) {
    this.data = data;this.width = width;this.height = height;
	this.minDistance = minDistance;
	this.sampleFrequency = sampleFrequency;
	this.reset();
}
//重置
PoissonDiskSampler.prototype.reset = function(){
	this.grid = new Grid( this.width, this.height, this.minDistance ,this.data);
	this.outputList = new Array();
	this.processingQueue = new RandomQueue();
}
//采样单元测试
PoissonDiskSampler.prototype.sampleUntilSolution = function(){
	while( this.sample() ){};
	return this.outputList;
}
//采样
PoissonDiskSampler.prototype.sample = function(){    
    if (0 == this.outputList.length) {//第一次采样
        this.queueToAll(this.grid.randomPoint());// 产生第一个采样点
		return true;
	}
	var processPoint = this.processingQueue.pop();	
	if (processPoint == null) return false;    // 过程队列为空，退出
		
	// 在过程点周围生成采样点，监测网格邻居，入股没有就加入队列
	for ( var i = 0; i < this.sampleFrequency; i++ ){
		samplePoint = this.grid.randomPointAround( processPoint );
		if ( ! this.grid.inNeighborhood( samplePoint ) ){
			this.queueToAll( samplePoint );
		}
	}
	return true;
}

PoissonDiskSampler.prototype.queueToAll = function ( point ){
	var valid = this.grid.addPointToGrid( point, this.grid.pixelsToGridCoords( point ) );
	if ( ! valid )
		return;
	this.processingQueue.push( point );
	this.outputList.push( point );
}
//网格初始化
function Grid( width, height, minDistance, data){
    this.width = width; this.height = height; this.minDistance = minDistance; this.data = data;
	this.cellSize = this.minDistance / Math.SQRT2;	this.pointSize = 2;
	this.cellsWide = Math.ceil( this.width / this.cellSize );
	this.cellsHigh = Math.ceil( this.height / this.cellSize );
    this.grid = [];
	for ( var x = 0; x < this.cellsWide; x++ ){
		this.grid[x] = [];
		for ( var y = 0; y < this.cellsHigh; y++ )
			this.grid[x][y] = null;
	}
}
//计算点的网格号
Grid.prototype.pixelsToGridCoords = function (point) {
	var gridX = Math.floor( point.x / this.cellSize );
	var gridY = Math.floor( point.y / this.cellSize );
	return { x: gridX, y: gridY };
}
//添加一个点的测试
Grid.prototype.addPointToGrid = function( pointCoords, gridCoords ){
	if ( gridCoords.x < 0 || gridCoords.x > this.grid.length - 1 )		                    return false;
	if ( gridCoords.y < 0 || gridCoords.y > this.grid[gridCoords.x].length - 1 ) 	return false;
	this.grid[ gridCoords.x ][ gridCoords.y ] = pointCoords;
	return true;
}
//随机给定点
Grid.prototype.randomPoint = function () {
    var index = getRandomInt(0,this.data.length-1);
	return { x: this.data[index].x, y: this.data[index].y };
}
//随机周围点
Grid.prototype.randomPointAround = function( point ){
	var r1 = Math.random();	var r2 = Math.random();	
	var radius = this.minDistance * (r1 + 1);     // 小于2倍最小距离的半径	
	
	for (var i = 0; i < this.data.length-5; i++) {      // 基于半径和角度的坐标
	    i = i + parseInt(5 * Math.random());
	    disX = Math.abs( this.data[i].x - point.x);
	    disY = Math.abs(this.data[i].y - point.y);
	    if ((disX * disX + disY * disY) - radius * radius < this.minDistance) {
	        return { x: this.data[i].x, y: this.data[i].y };
	    }
	}
}
//邻居监测
Grid.prototype.inNeighborhood = function (point) {    
	var gridPoint = this.pixelsToGridCoords( point );
	var cellsAroundPoint = this.cellsAroundPoint( point );

	for ( var i = 0; i < cellsAroundPoint.length; i++ ){
		if ( cellsAroundPoint[i] != null ){
			if ( this.calcDistance( cellsAroundPoint[i], point ) < this.minDistance ){
				return true;
			}
		}
	}
	return false;
}
//点周围的网格
Grid.prototype.cellsAroundPoint = function( point ){
	var gridCoords = this.pixelsToGridCoords( point );
	var neighbors = new Array();

	for ( var x = -2; x < 3; x++ ){
		var targetX = gridCoords.x + x;
		if ( targetX < 0 )			                        targetX = 0;
		if ( targetX > this.grid.length - 1 )		targetX = this.grid.length - 1;
		for ( var y = -2; y < 3; y++ ){
			var targetY = gridCoords.y + y;
			if ( targetY < 0 )              				                targetY = 0;
			if ( targetY > this.grid[ targetX ].length - 1 )	targetY = this.grid[ targetX ].length - 1;
			neighbors.push( this.grid[ targetX ][ targetY ] )
		}
	}
	return neighbors;
}
//计算两点间距离
Grid.prototype.calcDistance = function( pointInCell, point ){
	return Math.sqrt( (point.x - pointInCell.x)*(point.x - pointInCell.x)
	                + (point.y - pointInCell.y)*(point.y - pointInCell.y) );
}
//生成随机队列
function RandomQueue( a ){
	this.queue = a || new Array();
}
//添加一个元素
RandomQueue.prototype.push = function( element ){
	this.queue.push( element );
}
//移除最后一个点，并返回点
RandomQueue.prototype.pop = function(){
	randomIndex = getRandomInt( 0, this.queue.length );
	while (this.queue[randomIndex] === undefined) {// 检查队列是否为空   
	    var empty = true;
		for ( var i = 0; i < this.queue.length; i++ )
			if ( this.queue[i] !== undefined )	empty = false;		
		if ( empty )			return null;
		randomIndex = getRandomInt( 0, this.queue.length );
	}
	element = this.queue[ randomIndex ];
	this.queue.remove( randomIndex );
	return element;
}
//移除
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
//随机数 浮点-整数
function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
