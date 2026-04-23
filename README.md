# 1. Project Overview  

Built a User Management System — a full-stack MERN web application that manages user accounts with different roles and permissions.  

## 🎬 Demo

https://github.com/<your-username>/<your-repo>/assets/demo.mp4
or 
<video src="assets" controls width="100%"></video>

## The system supports:  
- Secure user authentication  
- Role-based authorization (RBAC)  
- Basic user lifecycle management (create, update, delete, view)  
- Separation of admin and regular user capabilities  

---

# 2. Tech Stack  

- Frontend: React.js  
- Backend: Node.js, Express  
- Database: MongoDB  
- Authentication: JWT-based authentication  
- Deployment: Backend on render, Frontend on vercel  

---

# 3. Functionality  

### 1. Admin  
Full access to user management system. admin can add users, managers and edit their data even admin his/her data.  

### 2. Manager  
limited access to user management system. manager can only see the list of users, managers. manager cannot see the data of admins. manager can edit their own profile and users profile but changing role is probhited for manager. (changing role has only access to admin only)  

### 3. User  
User has only access to see his/her own profile and edit their own profile.  

---

# 4. Authentication  

### User login with:  
- Email/username  
- Password  

- Passwords is securely hashed using bcrypt  

---

# 5. Authorization (RBAC)  

- Enforced role-based access control on backend routes.  

### Examples:  

#### 1. Only Admin can:  
- Create new users  
- Assign or change roles  
- Delete users  

#### 2. Manager can:  
- View list of users  
- View/update non-admin user details  

#### 3. User can:  
- View and update their own profile only  

---

# 6. User Management Features  

### Admin Capabilities  
- View searchable list of all users  
- Filters (e.g., by role, status)  
- Create new user  
  - Name, email, role, status (e.g., active/inactive)  
  - auto-generate password  
- Edit existing user  
  - Name, email, role, status  
- Soft delete or deactivate user (user cannot able to log-in if inactive)  
- View details of a single user

### Manager Capabilities  
- View own profile  
- Update own profile (name, password)  
- view list of existing user, managers (admins are invisible)  
- Edit existing user  
  - Name, email, status (role is prohibited for security reasons. changing role has only access to admin only)  

### User Capabilities  
- View own profile  
- Update own profile (name, password)  
- Cannot change own role  
- Cannot view other users’ profiles  

---

# 7. Deployment  

- backend  
- frontend




### ⚙️ Installation & Setup
