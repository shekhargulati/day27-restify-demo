angular.module("localjobs.services", ["ngResource"]).
    factory('Job', function ($resource) {
        var Job = $resource('http://127.0.0.1:8080/jobs/:jobId', {storyId: '@id'});
        Job.prototype.isNew = function(){
            return (typeof(this.id) === 'undefined');
        }
        return Job;
    });


angular.module("localjobs", ["ngRoute" , "localjobs.services"]).
    config(function ($routeProvider) {
        $routeProvider
            .when('/', {templateUrl: 'views/jobs/list.html', controller: JobListController})
            .when('/jobs/new', {templateUrl: 'views/jobs/create.html', controller: JobCreateController})
            .when('/jobs/:jobId', {templateUrl: 'views/jobs/detail.html', controller: JobDetailController});
    });

function JobListController($scope, Job) {
    $scope.jobs = Job.query();
    
}

function JobCreateController($scope, $routeParams, $location, Job) {

    $scope.job = new Job();

    $scope.save = function () {
    	$scope.job.$save(function (job, headers) {
    		$location.path('/');
        });
    };
}


function JobDetailController($scope, $routeParams, $location, Job) {
    var jobId = $routeParams.jobId;
    
    $scope.job = Job.get({jobId: jobId});

}