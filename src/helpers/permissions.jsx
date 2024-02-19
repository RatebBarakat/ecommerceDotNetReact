export class Permission {
  static can(auth, permission) {
    return true;
    return auth.permissions?.includes(permission);
  }
}
