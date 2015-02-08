angular
 .module('myApp', [])
 .controller('AppCtrl', AppCtrl);

function AppCtrl($scope, $http) {
  
    console.log("Hello World from controller");

var refresh = function() {
	$http.get('/poiList').success(function(response){
		console.log("I got the data I requested");
		$scope.poiList = response;
		$scope.poi = "";
	});
};



$scope.addContact = function() {
	console.log($scope.poi);
	$http.post('/poiList', $scope.poi).success(function(response) {
		console.log(response);
		refresh();
	});
};

$scope.remove = function(id) {
	console.log(id);
	$http.delete('/poiList/' + id).success(function(response) {
		refresh();
	});
};

$scope.edit = function(id) {
	console.log(id);
	$http.get('/poiList/' + id).success(function(response) {
		$scope.poi = response;
	});
};

$scope.update = function() {
	console.log($scope.poi._id)
	$http.put('/poiList/' + $scope.poi._id, $scope.poi).success(function(response) {
		refresh();
	});
};

$scope.deselect = function() {
	$scope.poi = "";
};

}