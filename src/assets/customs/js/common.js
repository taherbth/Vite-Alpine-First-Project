/**
 * Created by abutaher on 5/4/17.
 */
$( document ).ready(function() {
    let access_token = localStorage.getItem("token");
    // Get all organization API to Quantibly system   
    if(access_token){
        $.ajaxSetup({
          headers: {
              'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content')
              ,
              'Accept' : 'application/json',
              'Authorization' : 'Bearer '+access_token
          }                  
        });                      
    }
    $('.re-confirm').click(function(e){
        if(!confirmDialog()){
            e.preventDefault();
        }
    });
    $('.remove-item').click(function(e){
        if(confirmDialog()) {
            var param_first = $(this).attr('param-first');
            var param_second = $(this).attr('param-second');
            var action_url_first = $('#single-item-delete').attr('action-url-first');
            var action_url_second = $('#single-item-delete').attr('action-url-second');
            var action = action_url_first + '/' + param_first;

            if( action_url_second ){
                action = action + '/' + action_url_second + '/' + param_second
            }
            $('#single-item-delete').attr('action', ( action ));
            $('#single-item-delete').submit();
        }
    });
    $('.delete-single-item').click(function(e){
        var item_ids = $(this).attr('item-ids');
        var action_url = $(this).attr('action-url');
        var redirect_url = $(this).attr('redirect-url');
        var item_ids_array = [item_ids];
        var url = '/'+action_url;
        swal.fire({ 
            icon: 'warning',                 
            title: "Are you sure?",
            text: "You want to delete this item?",
            type: "warning",
            buttons: ['NO', 'YES'],
            showCancelButton: true,        
            closeOnConfirm: true,
            closeOnCancel: true
        }).then(function(result) {
            if(result.isConfirmed){                
                if( item_ids_array ){
                    $.ajax({                       
                        url: url,
                        data: { item_ids : item_ids_array } ,
                        type: "POST",
                        async: false,
                        dataType: "json",
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},

                        success:function(response) {
                            swal.fire({ 
                                icon: 'success',                 
                                title: "Great!",
                                text: response.message,
                                type: "success",
                                showCancelButton: false,
                                confirmButtonText: "Ok!",
                                closeOnConfirm: true,
                                closeOnCancel: false

                            }).then(function(isConfirmed) {
                                if(isConfirmed){
                                    //$("#row_"+item_ids).remove();
                                    location.href  = redirect_url;
                                }
                            });
                        },
                        error: function (error) {                            
                            console.log('error; ' + error.status);
                            let error_object = jQuery.parseJSON(error.responseText);
                            let message = error_object.message;                            
                            swal.fire({ 
                                icon: 'error',                 
                                title: "Opps!",
                                text: message,
                                type: "error",
                                showCancelButton: false,
                                confirmButtonText: "Ok!",
                                closeOnConfirm: true,
                                closeOnCancel: false

                            })
                        }
                    });
                }
            }      
            else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire("Cancelled", "Your data is safe.", "error");
            }  
        });        
    });
    $('.delete-multi-items').click(function(e){        
        var action_url = $(this).attr('action-url');
        var redirect_url = $(this).attr('redirect-url');
        var item_ids = document.getElementsByName('item_ids[]');
        var item_ids_array = [];
        var url = '/'+action_url;
        for (var index = 0; index < item_ids.length; index++) {
            if(item_ids[index].checked){
                item_ids_array[index] = item_ids[index].value;
            }
        }
        item_ids_array = item_ids_array.filter(Boolean);
        swal.fire({ 
            icon: 'warning',                 
            title: "Are you sure?",
            text: "You want to delete these items?",
            type: "warning",
            buttons: ['NO', 'YES'],
            showCancelButton: true,        
            closeOnConfirm: true,
            closeOnCancel: true
        }).then(function(result) {
            if(result.isConfirmed){                
                if( item_ids_array ){
                    $.ajax({
                        url: url,
                        data: { item_ids : item_ids_array } ,
                        type: "POST",
                        async: false,
                        dataType: "json",
                        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                        success:function(response) {
                            swal.fire({ 
                                icon: 'success',                 
                                title: "Great!",
                                text: response.message,
                                type: "success",
                                showCancelButton: false,
                                confirmButtonText: "Ok!",
                                closeOnConfirm: true,
                                closeOnCancel: false

                            }).then(function(isConfirmed) {
                                if(isConfirmed){   
                                    location.href  = redirect_url;                                 
                                    /* for (var index = 0; index < item_ids_array.length; index++) {
                                        $("#row_"+item_ids_array[index]).remove();
                                    } */
                                }
                            });
                        }
                    });
                }
            }      
            else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire("Cancelled", "Your data is safe.", "error");
            }  
        });
    });
    $('.delete-single-item-api').click(function(e){
        var item_ids = $(this).attr('item-ids');
        var action_url = $(this).attr('action-url');
        var redirect_url = $(this).attr('redirect-url');
        var item_ids_array = [item_ids];
        var url = '/'+action_url;
        let accessToken = localStorage.getItem('token'); 
        if(accessToken){
            $.ajaxSetup({
              headers: {
                  'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content')
                  ,
                  'Accept' : 'application/json',
                  'Authorization' : 'Bearer '+accessToken
              }                  
            });
            swal.fire({ 
                icon: 'warning',                 
                title: "Are you sure?",
                text: "You want to delete this item?",
                type: "warning",
                buttons: ['NO', 'YES'],
                showCancelButton: true,        
                closeOnConfirm: true,
                closeOnCancel: true
                }).then(function(result) {
                if(result.isConfirmed){                
                    if( item_ids_array ){
                        $.ajax({                       
                            url: url,
                            data: { item_ids : item_ids_array } ,
                            type: "POST",
                            async: false,
                            dataType: "json",
                            success:function(response) {
                                swal.fire({ 
                                    icon: 'success',                 
                                    title: "Great!",
                                    text: response.message,
                                    type: "success",
                                    showCancelButton: false,
                                    confirmButtonText: "Ok!",
                                    closeOnConfirm: true,
                                    closeOnCancel: false

                                }).then(function(isConfirmed) {
                                    if(isConfirmed){
                                        //$("#row_"+item_ids).remove();
                                        location.href  = redirect_url;
                                    }
                                });
                            },
                            error: function (error) {                            
                                console.log('error; ' + error.status);
                                let error_object = jQuery.parseJSON(error.responseText);
                                let message = error_object.message;                            
                                swal.fire({ 
                                    icon: 'error',                 
                                    title: "Opps!",
                                    text: message,
                                    type: "error",
                                    showCancelButton: false,
                                    confirmButtonText: "Ok!",
                                    closeOnConfirm: true,
                                    closeOnCancel: false

                                })
                            }
                        });
                    }
                }else if (result.dismiss === Swal.DismissReason.cancel) {
                    Swal.fire("Cancelled", "Your data is safe.", "error");
                }        
            });           
        }                
    });

    $('.delete-multi-items-api').click(function(e){
        var action_url = $(this).attr('action-url');
        var redirect_url = $(this).attr('redirect-url');
        var item_ids = document.getElementsByName('item_ids[]');
        var item_ids_array = [];
        var url = '/'+action_url;
        for (var index = 0; index < item_ids.length; index++) {
            if(item_ids[index].checked){
                item_ids_array[index] = item_ids[index].value;
            }
        }
        item_ids_array = item_ids_array.filter(Boolean);
        
        let accessToken = localStorage.getItem('token'); 
        if(accessToken){
            $.ajaxSetup({
              headers: {
                  'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content')
                  ,
                  'Accept' : 'application/json',
                  'Authorization' : 'Bearer '+accessToken
              }                  
            });
            swal.fire({ 
            icon: 'warning',                 
            title: "Are you sure?",
            text: "You want to delete this item?",
            type: "warning",
            buttons: ['NO', 'YES'],
            showCancelButton: true,        
            closeOnConfirm: true,
            closeOnCancel: true
            }).then(function(result) {
                if(result.isConfirmed){                
                    if( item_ids_array ){
                        $.ajax({                       
                            url: url,
                            data: { item_ids : item_ids_array } ,
                            type: "POST",
                            async: false,
                            dataType: "json",
                            success:function(response) {
                                swal.fire({ 
                                    icon: 'success',                 
                                    title: "Great!",
                                    text: response.message,
                                    type: "success",
                                    showCancelButton: false,
                                    confirmButtonText: "Ok!",
                                    closeOnConfirm: true,
                                    closeOnCancel: false

                                }).then(function(isConfirmed) {
                                    if(isConfirmed){
                                        //$("#row_"+item_ids).remove();
                                        location.href  = redirect_url;
                                    }
                                });
                            },
                            error: function (error) {                            
                                console.log('error; ' + error.status);
                                let error_object = jQuery.parseJSON(error.responseText);
                                let message = error_object.message;                            
                                swal.fire({ 
                                    icon: 'error',                 
                                    title: "Opps!",
                                    text: message,
                                    type: "error",
                                    showCancelButton: false,
                                    confirmButtonText: "Ok!",
                                    closeOnConfirm: true,
                                    closeOnCancel: false

                                })
                            }
                        });
                    }
                }
                else if (result.dismiss === Swal.DismissReason.cancel) {
                    Swal.fire("Cancelled", "Your data is safe.", "error");
                }        
            });           
        }
                
    });

    $('.attribute-group-select').change(function(e){
        var attribute_id = $(this).val();
        var attribute_value_id = $('#attribute_value_id').val();
        if( attribute_value_id ){
            var url_path = '/attribute/'+attribute_id+'/attribute_value/'+attribute_value_id+'/get_attribute_value_details';
        }else{
            var url_path = '/attribute/'+attribute_id+'/attribute_value/get_attribute_details';
        }

        if(attribute_id) {
            $.ajax({
                url: url_path,
                type: "GET",
                dataType: "json",
                success:function(data) {
                    console.log(data);
                    if( data[0].type=='color-or-texture'){
                        document.getElementById("show-color").style.display = 'block';
                        if( data[1] ){
                            document.getElementById("color-none").value = data[1].color;
                        }
                    }else{
                        document.getElementById("show-color").style.display = 'none';
                        document.getElementById("color-none").value = '';
                    }
                }
            });
        }
    });
    $('.access-permission-select').change(function(e){
        var role_id = $(this).val();
        var url_path = '/api/module/get_modules';
        if(role_id) {
            $.ajax({
                url: url_path,
                type: "GET",
                dataType: "json",
                success:function(data) {
                    console.log('Modules are : '+ data);
                    // $('#access_permission').html( data );

                    // console.log();
                    // $.each(data, function(key, value) {
                    //     console.log('Modules are : '+ value.name);
                    // });
                }
            });
        }
    });

    $('div.alert').not('.alert-important').delay(3000).fadeOut(350);
    $("#check_all").change(function () {
        $("input:checkbox").prop('checked', $(this).prop("checked"));
    });
    //$('#cp2').colorpicker();
    $("#cp2").init(function() {
        $('#cp2').colorpicker();
    });

    $(".custom-tag-input").init(function() {
        $('.custom-tag-input').tagsinput({
            allowDuplicates: false,
            itemValue: 'id',
            itemText: 'label'
        });
    }); 
    /* 
    $('.custom-tag-input').tagsinput({
        allowDuplicates: false,
        itemValue: 'id',
        itemText: 'label'
    }); */

    /* $("input:checkbox").change(function() {
        var att_id = $(this).val();
        var att_val = $(this).attr("name");
        var ischecked= $(this).is(':checked');
        if(ischecked)
            $('#product_combination').tagsinput('add', { id: att_id, label: att_val });
        else if(!ischecked)
            $('#product_combination').tagsinput('remove', { id: att_id, label: att_val });
    }); */
    $(".pos_user").change(function() {
        var ischecked= $(this).is(':checked');
        if(ischecked)
            $(".multiple-select").show();
        else if(!ischecked)
            $(".multiple-select").hide();
    });
});

function confirmDialog(){
    //return confirm('Are you sure you want to delete this item?')
    swal.fire({ 
        icon: 'warning',                 
        title: "Are you sure?",
        text: "You want to delete this item?",
        type: "warning",
        buttons: ['NO', 'YES'],
        showCancelButton: true,        
        closeOnConfirm: true,
        closeOnCancel: true

    }).then(function(isConfirmed) {
        if(isConfirmed){
            return true;
        }        
    });
}


