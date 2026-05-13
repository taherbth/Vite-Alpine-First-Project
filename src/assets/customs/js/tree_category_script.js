(function(){
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
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
            // Create the tree inside the <div id="tree"> element.
            $("#"+id).fancytree({
                checkbox: true,
                // Initial node data that sets 'lazy' flag on some leaf nodes
                selectMode : selectMode,
                source: that.data_set,

                select: function(select, data) {
                    document.getElementById('parent').value = data.node.key;

                    // Display list of selected nodes
                    var selNodes = data.tree.getSelectedNodes();
                    var product_categories = [];
                    document.getElementById('product_categories').value = product_categories;
                    // convert to title/key array
                    var selKeys = $.map(selNodes, function(data) {
                        product_categories.push(data.key);
                    });
                    if( !data.node.isSelected() ){
                        product_categories = product_categories.filter(function(e) { return e !== data.node.key })
                    }
                    document.getElementById('product_categories').value = product_categories;
                },
            });

            var selectedKeys = $.map($( "#"+id).fancytree("getTree").getSelectedNodes(), function (data) {
                return data.key;
            });

            $("#product_categories").val(selectedKeys.join(","));
            $("#"+id).fancytree("getTree").reload();
        },
        setData: function(){
            //It should be from API
            $.ajax({
                url: '/category/get_tree_data',
                data: { parent : $('#parent').val() , this_category : $('#this_category').val(), product_id: $('.tree-category').attr('product-id') } ,
                type: "GET",
                async: false,
                dataType: "json",
                success:function(tree_data) {
                    that.data_set = tree_data.data;
                }
            });
        },
    }
    TreeCategory.init();
})();