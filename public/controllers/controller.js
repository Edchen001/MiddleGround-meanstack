angular
 .module('myApp', [])
 .controller('AppCtrl', AppCtrl)
 .factory("MyYelpAPI", function($http) {
      return {
          "retrieveYelp": function(name, callback) {
              var method = 'GET';
              var url = 'http://api.yelp.com/v2/search';
              var params = {
                      callback: 'angular.callbacks._0',
                      location: 'San+Francisco',
                      oauth_consumer_key: OAUTH_CONSUMER_KEY, //Consumer Key
                      oauth_token: OAUTH_TOKEN, //Token
                      oauth_signature_method: "HMAC-SHA1",
                      oauth_timestamp: new Date().getTime(),
                      oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
                      term: 'food'
                  };
              var consumerSecret = CONSUMER_SECRET; //Consumer Secret
              var tokenSecret = TOKEN_SECRET; //Token Secret
              var signature = oauthSignature.generate(method, url, params, consumerSecret, tokenSecret, { encodeSignature: false});
              params['oauth_signature'] = signature;
              $http.jsonp(url, {params: params}).success(callback);
          }
      }
  });

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

};
