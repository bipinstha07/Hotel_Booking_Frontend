import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import User from "../User";
import Login from "../components/UserRegister/Login";



const routerObj = createBrowserRouter([{
    path: '/',
    element:<App />
},
{
    path:'/register',
    element:<User/>
},
{
    path:'/login',
    element:<Login/>
}
// {
//     path:'/admin',
//     element: <LayoutAdmin/>,
//     children:[
//         {
//             index:true,
//             element: <AdminDashboard/>
//         },
//         {
//             path:"performance",
//             element: <Performance/>
//         }
      

//     ]
// }

])



const RouterConfig = ()=>{
    return(<>
    <RouterProvider router={routerObj}/>
   
    </>)
}

export default RouterConfig;
