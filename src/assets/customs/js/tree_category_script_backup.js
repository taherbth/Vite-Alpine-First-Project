(function(){
    var TreeCategory = {

        init: function(){
            that = this;
            tree_type = 'check-tree';
            id = '';
            data_set = [];
            product_categories = [];
            product_id = null;
            $('.tree-category').each(function() {
                that.initTree(this.id);
            });
        },

        initTree: function(id){
            document.getElementById('product_categories').value = '1';
            that.product_id = null;

            that.tree_type = $('.tree-category').attr('tree-type-attr');
            that.id = id;
            that.setData();
            selectMode = 0;
            // selectMode: 2,  1:single, 2:multi, 3:multi-hier
            if(that.tree_type == "check-tree"){
                selectMode = 2;
            }else if(that.tree_type == 'radio-tree'){
                selectMode = 1;
            }else{
                selectMode = 3;
            }
            $("#"+id).dynatree( {
                checkbox: true,
                selectMode: selectMode,
                children: that.data_set,

                onSelect: function(select, node) {
                    document.getElementById('parent').value = node.data.key;
                    // Display list of selected nodes
                    var selNodes = node.tree.getSelectedNodes();
                    var product_categories = [];
                    document.getElementById('product_categories').value = product_categories;
                    // convert to title/key array
                    var selKeys = $.map(selNodes, function(node) {
                        product_categories.push(node.data.key);
                        document.getElementById('product_categories').value = product_categories;
                        return "[" + node.data.key + "]: '" + node.data.title + "'";
                    });
                    $("#echoSelection2").text(selKeys.join(", "));
                },
                onClick: function(node, event) {
                    // We should not toggle, if target was "checkbox", because this
                    // would result in double-toggle (i.e. no toggle)
                    if (node.getEventTargetType(event) == "title")
                        node.toggleSelect();
                },
                onKeydown: function(node, event) {
                    if (event.which == 32) {
                        node.toggleSelect();
                        return false;
                    }
                },

            });

            var selectedKeys = $.map($( "#"+id).dynatree("getSelectedNodes"), function (node) {
                return node.data.key;
            });
            $("#product_categories").val(selectedKeys.join(","));
            $("#"+id).dynatree("getTree").reload();

        },
        setData: function(){
            //It should be from API
            $.ajax({
                url: '/api/category/get_tree_data',
                data: { parent : $('#parent').val() , this_category : $('#this_category').val(), product_id: $('.tree-category').attr('product-id') } ,
                type: "GET",
                async: false,
                dataType: "json",
                success:function(tree_data) {
                    // alert('Here: '+ tree_data.data)
                    that.data_set = tree_data.data;
                }
            });
        },
    }
    TreeCategory.init();
})();