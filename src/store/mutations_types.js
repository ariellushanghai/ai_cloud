export default {
    'LOGOUT': 'LOGOUT',
    'BUILD_MENU': 'BUILD_MENU',
    'SAVE_USER_INFO': 'SAVE_USER_INFO',
    'SET_PROJECTS_LIST': 'SET_PROJECTS_LIST',
    'HIDE_GLOBAL_HEADER': 'HIDE_GLOBAL_HEADER',
    'SHOW_GLOBAL_HEADER': 'SHOW_GLOBAL_HEADER',
    'MENU_ITEMS': {
        'userManager': {route: 'userManager', 'menu_name': '用户管理'},
        'development': {route: 'development', 'menu_name': '模型开发'},
        'training': {route: 'project', 'menu_name': '模型训练'},
        'inference': {route: 'inference', 'menu_name': '模型预测'},
        'deployment': {route: 'deployment', 'menu_name': '部署上线'},
        'storage': {route: 'storage', 'menu_name': '数据存储'}
    }
}
