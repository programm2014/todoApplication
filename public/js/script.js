$(document).ready(function(){

	$("#form").on("submit", function(e){
		e.preventDefault();

		var title =$("#todo").val();
		
		 var objet ={
		 	title : title,
		 };

		$.ajax({
			url:"/todo",
			type: "POST",
			data: {data : objet },
			success: function(data){
				/*console.log(data);*/
				var toAdd = '<div class="well"> <ul><li>'+ data.title + '</li> </ul> </div>';
				$("#todoContainer").append(toAdd);
			}
		});
		$("#todo").val("");
	});

	/*comment update*/
	$(".todoEdit").on("click", function(e){
      e.preventDefault();
      $(this).parent().find(".todoUpdate").css("display", "inline");
      //$(".commentUpdate", this).css("display", "inline");
      var editUrl = $(this).attr("href"); 
      var inp =$(this).parent().find(".textedit");
      $.ajax({
          url: editUrl,
          type: "GET",
          success: function(data){
            inp.val(data.title);
          /* console.log(data);*/
            console.log($(this).parent().find(".textedit").val(data.title));
            
          }
      });
  });


	$(".todoUpdate").on("submit", function(e){
      e.preventDefault();
      var updateUrl = $(this).attr("action");
       var updateVal = $(this).parent().find(".textedit").val();
       //var p =$("p:contains(hellooo)");
      
      $.ajax({
        url: updateUrl,
        type: "POST",
        data:{data: updateVal},
        success: function(data){
         /* console.log(data.text);*/
         $("li:contains("+data.title+")").text(updateVal) ;
         
        }
      });
      $(this).css("display", "none");
  });

	/*delete todo*/
	$(".todoDelete").on("submit", function(e){
      e.preventDefault();
      var deleteUrl = $(this).attr("action");
      
      $.ajax({
        url: deleteUrl,
        type: "POST",
        success: function(data){
            /*console.log(data);*/
            $("li:contains("+data.title+")").parent().parent().hide();
        }
      });
});
});