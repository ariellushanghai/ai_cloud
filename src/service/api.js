import network from '@/service/network'

export default {
  // 文档地址:  http://10.25.81.230:31082/swagger-ui.html
  // 根据userName验证用户是否存在及权限
  loginAICloud(cred) {
    // return network.get('loginAICloud.json');
    return network.post(`/auth`, cred);
  },
  // 登出AI Cloud
  logoutAICloud() {
    // return network.get('logoutAICloud.json');
    return network.post(`/signout`, {});
  },
  // 修改密码
  changePasswd(obj) {
    return network.post(`/user/password`, obj);
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
    console.log(`getProjects(${userName})`)
    // return network.get('getProjects.json');
    return network.get(`/projects/${userName}`);
  },
  // 新增训练项目
  addProject(obj) {
    // return network.get('addProject.json');
    return network.post(`/projects`, obj);
  },
  // 删除训练项目
  delProject(proId) {
    return network.delete(`/projects/${proId}`);
  },
  // 项目对应训练List
  getTrains(obj) {
    // return network.get('getTrains.json');
    return network.get(`/trains`, {
      params: obj
    });
  },
  // 获取基础镜像列表
  getImages() {
    // return network.get('getImages.json');
    return network.get(`/images`);
  },
  // 构建镜像
  buildImage(obj) {
    let req = network.create({
      timeout: 60 * 1000
    });
    console.log(`buildImage(): `, req);
    return req.post(`/image/build`, obj);
  },
  // 部署镜像
  deployImage(obj) {
    let req = network.create({
      timeout: 60 * 5 * 1000
    });
    console.log(`deployImage(): `, req);
    return req.post(`/image/deploy`, obj);
  },
  // 获取训练日志
  getLog(id) {
    // return network.get('getLog.json');
    return network.get(`/logs/${id}`);
  },

  baseUploadToAddr(path) {
    return `${network.defaults.baseURL}${path}`
  }
}
