var knackapp = angular.module('knack',[]);

knackapp.controller("MainController",function($http,$scope){

	var knackHeader = {'X-Knack-Application-Id': 'YOUR_APP_ID',
                'X-Knack-REST-API-Key': 'YOUR_REST_API_KEY'};

    
    //These have been initialized just for reference.Will be removed
	$scope.no_col = 7;
	$scope.sheeturl= "https://spreadsheets.google.com/feeds/cells/1uufXThwKpc4HimGiGs3B8oFQLYgBM2ofQm3K5WQjtrw/od6/public/basic?alt=json";
	$scope.insert_into_object = "https://api.knackhq.com/v1/objects/object_26/";

	$scope.fieldInObj = [];		//field in obj for mapping
	$scope.fieldInObj = ["field_2","field_43","field_119","field_25","field_36","",""];
	


	//button show flag's
	$scope.transformRuleButton = 0;
	$scope.transformButton = 0;
	$scope.InsertKnackButton = 0;

	$scope.col_transform = {};  //rules of transformations for all columns

	//function to ng-repeat x times for headers
	$scope.getTimes=function(){
		if($scope.table_flag==1){
			return new Array($scope.table_headers.length);	
		}	     
	};


//function to get transformation rules using the connected objects
	$scope.getTransformInfo = function(){
		
		for(i=0;i<$scope.insert_into_fields_type.length;i++){		
			console.log($scope.insert_into_fields_type[i]);
			if($scope.insert_into_fields_type[i] == "normal")
				{
					$scope.col_transform[i] = {};
					console.log("continue");
					continue;
				}
			var tempurl = "https://api.knackhq.com/v1/objects/" + $scope.insert_into_fields_type[i] + "/records";

			console.log(tempurl);

			$.ajax({
		        url: tempurl,
		        headers:knackHeader,
		        success: function (response) {
		            console.log("Requesting field transformRecords");
		            console.log(response);

                	var tempObj = {};
                	var recordsRes = response.records;
					console.log(recordsRes);

					for(j=0;j<recordsRes.length;j++){
						console.log(recordsRes[j][$scope.fieldInObj[i]]);
						console.log(recordsRes[j]["id"]);

						tempObj[recordsRes[j][$scope.fieldInObj[i]]] = recordsRes[j]["id"];
					}
					$scope.col_transform[i] = tempObj;
					console.log($scope.col_transform);
		        },
		        async: false
		    });

			
		}

		$scope.transformButton = 1;
	

	};



//transforming all records into knack structure using the fetched rules
	$scope.transformRecords = function(sheeturl,no_col,insert_into_object){

		var tbody = angular.copy($scope.table_body);

		for(i=0;i<$scope.insert_into_fields_type.length;i++){	

			if($scope.insert_into_fields_type[i]=="normal"){	//not a connected object => normal field

				for(j=0;j<tbody.length;j++)	
				{
					tbody[j][i] =  $scope.insert_into_fields[i] +":"+"\"" + tbody[j][i] + "\"";
				}

			}
			else{

				for(j=0;j<tbody.length;j++)
				{
					/*field_153:[{"id":"561f37b7058451310a1b0910","identifier":"MR12-HW"}]
					console.log(tbody[i]);
					console.log(tbody[j][i] + "  --  " + $scope.col_transform[i][tbody[j][i]] );
					console.log($scope.col_transform[i]);*/
					tbody[j][i] =  $scope.insert_into_fields[i]  +":[{'id':'" + $scope.col_transform[i][ tbody[j][i] ] +"','identifier':'"+ tbody[j][i] +"'}]" ; 
				}

			}



		}
		$scope.table_body_transformed = tbody;
		$scope.InsertKnackButton = 1;

	}



//inserting all the transformed records into knack object
	$scope.insertIntoKnack = function(insert_into_object){

		var postString = "";

		var temp = $scope.table_body_transformed;
		for(i=0;i<temp.length;i++){
			postString = "{";
			for(j =0;j<temp[i].length;j++)
			{
				postString += temp[i][j];
				if(j<(temp[i].length-1)){	postString += ","; }

			}
			postString += "}"

			console.log(postString);
			var postData = eval("(" + postString + ")");
			console.log(JSON.stringify(eval("(" + postString + ")")));
			$.ajax({
            url: insert_into_object+"records",
            type: 'POST',
            data:postData,
            headers: knackHeader,
            success: function(data) {
              alert('Record Inserted');
            },
            error: function(error){
                console.log(error);
            },
		        async: false
        });


		}

	}


//getting data from a published google sheet
	$scope.getSheet = function(sheeturl,no_col,insert_into_object){

		$http.get(sheeturl).then(function(response){

			console.log(response.data);
			console.log(response.data.feed.entry.length);
			$scope.table_rows = response.data.feed.entry.length/no_col;

			$scope.table_headers = [];
			for(i=0;i<no_col;i++){
				$scope.table_headers.push(response.data.feed.entry[i].content['$t']);
			}
			console.log($scope.table_headers);

			$scope.table_body = [];


			for(i=0;i<$scope.table_rows-1;i++){
				var temparr=[];
				for(j=7*(i+1);j<(7*(i+1))+7;j++){
					temparr.push(response.data.feed.entry[j].content['$t']);
				}
				$scope.table_body.push(temparr);
							console.log($scope.table_body);

			}
			console.log($scope.table_body);
			//flag that table data has been fetched
			$scope.table_flag = 1;
			$scope.getTimes();
			$scope.table_body_transformed = $scope.table_body;


		});
		
		$scope.insert_into_fields=[];
		$scope.insert_into_fields_type=[];

		$http({method:'GET',url:insert_into_object,headers:knackHeader }).then(function(response){

			console.log(response.data.object.fields);

			for(i=0;i<response.data.object.fields.length;i++){

				console.log(response.data.object.fields[i]);
				$scope.insert_into_fields.push(response.data.object.fields[i].key);
				if(response.data.object.fields[i].relationship == null || angular.isUndefined(response.data.object.fields[i]) )
				{
					$scope.insert_into_fields_type.push("normal");
				}
				else{
					$scope.insert_into_fields_type.push(response.data.object.fields[i].relationship["object"]);		//connection
				}

			}
			console.log($scope.insert_into_fields_type);
			console.log($scope.insert_into_fields);
		})

       $scope.transformRuleButton = 1;

	}


	
//dummy function to check object structure
	$scope.getObjectsInfo=function(){
		var url1 = "https://api.knackhq.com/v1/objects/object_26/";
		$http({method:'GET',url:url1,headers:knackHeader }).then(function(response){

			console.log(response);
		})

	};

})