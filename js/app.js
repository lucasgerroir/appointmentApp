
/**
 * Main AngularJS Web Application
 */
var app = angular.module('AppointmentApp', [
  'ngRoute'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "views/home.html", controller: "homePageCtrl"})
    .when("/delete", {templateUrl: "views/delete.html", controller: "actionCtrl"})
    .when("/update", {templateUrl: "views/update.html", controller: "actionCtrl"})
    .when("/create", {templateUrl: "views/create.html", controller: "actionCtrl"})
    // else 404
    .otherwise("/404", {templateUrl: "views/404.html", controller: "PageCtrl"});
}]);


/**
 * Controllers
 */

/**
 * Controller retreives the information from the JSON file and uses HMTL5 local storage to store it.
 * @param object $scope      stores an object of all variables and functions relative to this scope
 * @param obejct $http   
 */
app.controller('AppointmentApp', function ($scope, $http) {
	
	$scope.init = function () {
		
		// load the json data
		$http.get('data/port.json').then(function(data) {
			
			//just make sure it is formatted properly
			var myobj = JSON.stringify(data);
			    myobj = JSON.parse(myobj);
			
		    var appointments = myobj.data;
		    
		    //store the appointments using html5 local storage
		    localStorage.setItem("appointments", JSON.stringify(appointments));
			
		}, function errorCallback(response) {
			
			//add some failure to load json file feedback
		    console.log("failure to load data");
		}); 
		
	 };
});

/**
 * Controller creates the appointment list on the main page
 * @param object $scope      stores an object of all variables and functions relative to this scope
 * @param obejct $location   stores all the infromation on the current url such as passed parameters
 */
app.controller('homePageCtrl', function ($scope, $location) {
	
	jQuery(".success").delay(900).fadeOut();
	// id of appointment for  requested action 
	$scope.action_resp= $location.search().action;
	
	var appoin = localStorage.getItem("appointments");
	var appointments = JSON.parse(appoin);
	
	console.log(appointments); 
    // in able to sort we need to restructure the data without the ids
    var appt_without_ids = [];
    jQuery.each( appointments, function( key, value ) {
    	appt_without_ids.push(value);
    });
    
    // sort the appointments by startime.
    var cron_appoint = appt_without_ids.sort(function(x, y){
       	return x.startTime > y.startTime;
	});
    
    // pass the appointments to the view
	$scope.appointments = cron_appoint;
	

});


/**
 * Controller handles all actions like updating, deleting or creating appointments
 * @param object $scope      stores an object of all variables and functions relative to this scope
 * @param obejct $location   stores all the infromation on the current url such as passed parameters
 */
app.controller('actionCtrl', function ($scope, $location) {
	
	// add date picker
	jQuery( ".datepicker" ).datetimepicker({ dateFormat: "yy-m-d", timeFormat: 'Thh:mm:ssTZD'});
	
	// id of appointment for  requested action 
	var appointment_id = $location.search().id; 
	
	// get the appointments from local storage
	var appoin = localStorage.getItem("appointments");
	var appointment_info = JSON.parse(appoin);
	
	// if we are not creating a new appointment setup info for the view
	if (appointment_info[appointment_id]) {
		
		// set
		$scope.title = appointment_info[appointment_id].title;
		$scope.description = appointment_info[appointment_id].description;
		$scope.startTime = appointment_info[appointment_id].startTime;
		$scope.endTime = appointment_info[appointment_id].endTime;
	}

	// handles all updating functionality
	$scope.updateAppointment = function() {
		
		// store updated values
		var update_obj = {};
		update_obj.title = $scope.title;
		update_obj.description = $scope.description;
		update_obj.startTime = $scope.startTime;
		update_obj.endTime = $scope.endTime;
		update_obj.id = appointment_id;
		
		// relocate back to the main page
		appointment_info[appointment_id] = update_obj;
		localStorage.setItem("appointments", JSON.stringify(appointment_info));
		$location.search().action = "updated"; 
		$location.path("/");

	}
	
	// handles all deleting functionality
	$scope.deleteAppointment = function() {
		
		// delete appointment
		delete appointment_info[appointment_id];
		
		// relocate back to the main page
		localStorage.setItem("appointments", JSON.stringify(appointment_info));
		$location.search().action = "deleted"; 
		$location.path("/");

	}
	
	// handles all creating functionality
	$scope.createAppointment = function() {
		
	  // do a few checks to make sure the fields were filled out properly	
	   if ( $scope.title == null || $scope.title == "",
	        $scope.description == null || $scope.description == "",
	        $scope.startTime == null || $scope.startTime == "",
	        $scope.endTime == null || $scope.endTime == "")
        {
		  $scope.msg = "Please fill in all fields";
	      return;
        } 
	
	   //create the new object of inputted data
		var create_obj = {};
		create_obj.title = $scope.title;
		create_obj.description = $scope.description;
		create_obj.startTime = $scope.startTime;
		create_obj.endTime = $scope.endTime;
		
		//generate the new id for the created appointment
		var last_id = appointment_info[Object.keys(appointment_info)[Object.keys(appointment_info).length - 1]].id;
		var new_id = last_id + 1;
		create_obj.id = new_id;
		
		// add it to appointments
		appointment_info[new_id] = create_obj;
		
		// relocate back to the main page
		localStorage.setItem("appointments", JSON.stringify(appointment_info));
		$location.search().action = "created"; 
		$location.path("/"); 
	}

});


