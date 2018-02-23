import network from '@/service/network'

export default {
  // 文档地址:  http://10.25.81.230:31082/swagger-ui.html
  // 根据userName验证用户是否存在及权限
  loginAICloud(userName) {
    return network.get('loginAICloud.json');
    // return network.get(`/auth/${userName}`);
  },
  // 登出AI Cloud
  logoutAICloud(userName) {
    return network.get('logoutAICloud.json');
    // return network.post(`/signout`);
  },
  // 用户上传文件
  uploadFile(path) {

    // return network.post(`/upload`, {
    //   params: {
    //     path: path
    //   }
    // });
  },
  // 根据用户路径删除文件，不能删除有文件的目录
  deleteFile(path) {
    // return network.get('deleteFileFailure.json');
    return network.delete(`/file`, {
      params: {
        path: path
      }
    });
  },
  // 根据用户路径获取目录及文件列表
  ls(path) {
    // return network.get('ls.json');
    return network.get(`/file`, {
      params: {
        path: path
      }
    });
  },
  // 获取用户信息
  getUserInfo() {

  },
  // admin角色用户可以获取用户列表
  getUsers() {
    // return network.get('users.json');
    return network.get('/users');
  },
  // admin角色用户可以新增用户
  addUser(user) {
    // return network.get('users.json');
    return network.post(`/user`, user);
  },
  // admin角色用户可以删除用户
  delUser(user) {
    // return network.get('users.json');
    return network.delete(`/user`, {
      params: {userName: user.userName}
    });
  },
  // 训练项目List
  getProjects(userName) {
    return network.get('getProjects.json');
    // return network.get(`/projects/${userName}`);
  },
  // 新增训练项目
  addProject(obj) {
    return network.get('addProject.json');
    // return network.post(`/projects`, {
    //   params: {
    //     userName: 'userName',
    //     proName: 'newProj',
    //     dirPath: 'dirPath',
    //     type: '00'
    //   }
    // });
  },
  // 项目对应训练List
  getTrains(userName) {
    return network.get('getTrains.json');
    // return network.get(`/projects/${userName}`);
  },
  // 获取基础镜像列表
  getImages() {
    return network.get('getImages.json');
    // return network.get(`/projects/images`);
  },

  baseUploadToAddr(path) {
    return `${network.defaults.baseURL}${path}`
  }
}
