// ��ʼ��
function PoissonDiskSampler(data, width, height, minDistance, sampleFrequency) {
    this.data = data;this.width = width;this.height = height;
	this.minDistance = minDistance;
	this.sampleFrequency = sampleFrequency;
	this.reset();
}
//����
PoissonDiskSampler.prototype.reset = function(){
	this.grid = new Grid( this.width, this.height, this.minDistance ,this.data);
	this.outputList = new Array();
	this.processingQueue = new RandomQueue();
}
//������Ԫ����
PoissonDiskSampler.prototype.sampleUntilSolution = function(){
	while( this.sample() ){};
	return this.outputList;
}
//����
PoissonDiskSampler.prototype.sample = function(){    
    if (0 == this.outputList.length) {//��һ�β���
        this.queueToAll(this.grid.randomPoint());// ������һ��������
		return true;
	}
	var processPoint = this.processingQueue.pop();	
	if (processPoint == null) return false;    // ���̶���Ϊ�գ��˳�
		
	// �ڹ��̵���Χ���ɲ����㣬��������ھӣ����û�оͼ������
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
//�����ʼ��
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
//�����������
Grid.prototype.pixelsToGridCoords = function (point) {
	var gridX = Math.floor( point.x / this.cellSize );
	var gridY = Math.floor( point.y / this.cellSize );
	return { x: gridX, y: gridY };
}
//���һ����Ĳ���
Grid.prototype.addPointToGrid = function( pointCoords, gridCoords ){
	if ( gridCoords.x < 0 || gridCoords.x > this.grid.length - 1 )		                    return false;
	if ( gridCoords.y < 0 || gridCoords.y > this.grid[gridCoords.x].length - 1 ) 	return false;
	this.grid[ gridCoords.x ][ gridCoords.y ] = pointCoords;
	return true;
}
//���������
Grid.prototype.randomPoint = function () {
    var index = getRandomInt(0,this.data.length-1);
	return { x: this.data[index].x, y: this.data[index].y };
}
//�����Χ��
Grid.prototype.randomPointAround = function( point ){
	var r1 = Math.random();	var r2 = Math.random();	
	var radius = this.minDistance * (r1 + 1);     // С��2����С����İ뾶	
	
	for (var i = 0; i < this.data.length-5; i++) {      // ���ڰ뾶�ͽǶȵ�����
	    i = i + parseInt(5 * Math.random());
	    disX = Math.abs( this.data[i].x - point.x);
	    disY = Math.abs(this.data[i].y - point.y);
	    if ((disX * disX + disY * disY) - radius * radius < this.minDistance) {
	        return { x: this.data[i].x, y: this.data[i].y };
	    }
	}
}
//�ھӼ��
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
//����Χ������
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
//������������
Grid.prototype.calcDistance = function( pointInCell, point ){
	return Math.sqrt( (point.x - pointInCell.x)*(point.x - pointInCell.x)
	                + (point.y - pointInCell.y)*(point.y - pointInCell.y) );
}
//�����������
function RandomQueue( a ){
	this.queue = a || new Array();
}
//���һ��Ԫ��
RandomQueue.prototype.push = function( element ){
	this.queue.push( element );
}
//�Ƴ����һ���㣬�����ص�
RandomQueue.prototype.pop = function(){
	randomIndex = getRandomInt( 0, this.queue.length );
	while (this.queue[randomIndex] === undefined) {// �������Ƿ�Ϊ��   
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
//�Ƴ�
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
//����� ����-����
function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
