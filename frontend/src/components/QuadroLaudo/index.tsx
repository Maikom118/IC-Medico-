import "./index.css"
import { Bookmark, SquarePen, X } from 'lucide-react';
const QuadroLaudo = () => {


 const user = {
  name: "UserTest",
  ImageProfile: "https://i.ibb.co/YFcZgNzL/Whats-App-Image-2024-11-08-at-23-12-15.jpg",
  Titletask: "Avaliação Clínica e Prescrição Terapêutica para Paciente com Sintomas Respiratórios"
 }


 return (
  <>
   <div className="container-laudo">
    <div className="laudo">

     {/* Col-1 - Pendente */}
     <div className="card-laudo">
      <div className="header-card-laudo">
       <span className="name-card">Pendente</span>
       <button className="mais">
        <SquarePen size={16} />
       </button>
      </div>

      <div className="tasks">
       <div className="taskHeader">
        <p className="title">
         {user.Titletask?.length > 30
          ? `${user.Titletask.substring(0, 30)}...`
          : user.Titletask}
        </p>

        <button className="mais">
         <X size={17} />
        </button>
       </div>

       <div className="taskBody">
        <div className="alta">
         <span>Prioridade: Alta</span>
        </div>
       </div>


       <div className="taskFooter">
        <Bookmark />
        <div className="container-perfil">
         <img src={user.ImageProfile} />
        </div>
       </div>

      </div>


      <div className="add-card">
       + Criar
      </div>

     </div>
     {/* Col-1 */}

     {/* Col-2 - Em Andamento*/}
     <div className="card-laudo">
      <div className="header-card-laudo">
       <span className="name-card">Em Andamento</span>
       <button className="mais">
        <SquarePen size={16} />
       </button>
      </div>

      <div className="tasks">
       <div className="taskHeader">
        <p className="title">
         {user.Titletask?.length > 30
          ? `${user.Titletask.substring(0, 30)}...`
          : user.Titletask}
        </p>

        <button className="mais">
         <X size={17} />
        </button>
       </div>

       <div className="taskBody">
        <div className="alta">
         <span>Prioridade: Alta</span>
        </div>
       </div>


       <div className="taskFooter">
        <Bookmark />
        <div className="container-perfil">
         <img src={user.ImageProfile} />
        </div>
       </div>

      </div>

      <div className="tasks">
       <div className="taskHeader">
        <p className="title">
         {user.Titletask?.length > 30
          ? `${user.Titletask.substring(0, 30)}...`
          : user.Titletask}
        </p>

        <button className="mais">
         <X size={17} />
        </button>
       </div>

       <div className="taskBody">
        <div className="alta">
         <span>Prioridade: Alta</span>
        </div>
       </div>


       <div className="taskFooter">
        <Bookmark />
        <div className="container-perfil">
         <img src={user.ImageProfile} />
        </div>
       </div>

      </div>

     </div>
     {/* Col-2 */}

     {/* Col-2 - Concluido*/}
     <div className="card-laudo">
      <div className="header-card-laudo">
       <span className="name-card">Concluido</span>
       <button className="mais">
        <SquarePen size={16} />
       </button>
      </div>

      <div className="tasks">
       <div className="taskHeader">
        <p className="title">
         {user.Titletask?.length > 30
          ? `${user.Titletask.substring(0, 30)}...`
          : user.Titletask}
        </p>

        <button className="mais">
         <X size={17} />
        </button>
       </div>

       <div className="taskBody">
        <div className="alta">
         <span>Prioridade: Alta</span>
        </div>
       </div>


       <div className="taskFooter">
        <Bookmark />
        <div className="container-perfil">
         <img src={user.ImageProfile} />
        </div>
       </div>

      </div>

      <div className="tasks">
       <div className="taskHeader">
        <p className="title">
         {user.Titletask?.length > 30
          ? `${user.Titletask.substring(0, 30)}...`
          : user.Titletask}
        </p>

        <button className="mais">
         <X size={17} />
        </button>
       </div>

       <div className="taskBody">
        <div className="alta">
         <span>Prioridade: Alta</span>
        </div>
       </div>


       <div className="taskFooter">
        <Bookmark />
        <div className="container-perfil">
         <img src={user.ImageProfile} />
        </div>
       </div>

      </div>


     </div>
     {/* Col-2 */}

     {/* Col-2 - Revisado*/}
     <div className="card-laudo">
      <div className="header-card-laudo">
       <span className="name-card">Revisado</span>
       <button className="mais">
        <SquarePen size={16} />
       </button>
      </div>

      <div className="tasks">
       <div className="taskHeader">
        <p className="title">
         {user.Titletask?.length > 30
          ? `${user.Titletask.substring(0, 30)}...`
          : user.Titletask}
        </p>

        <button className="mais">
         <X size={17} />
        </button>
       </div>

       <div className="taskBody">
        <div className="alta">
         <span>Prioridade: Alta</span>
        </div>
       </div>


       <div className="taskFooter">
        <Bookmark />
        <div className="container-perfil">
         <img src={user.ImageProfile} />
        </div>
       </div>

      </div>

      <div className="tasks">
       <div className="taskHeader">
        <p className="title">
         {user.Titletask?.length > 30
          ? `${user.Titletask.substring(0, 30)}...`
          : user.Titletask}
        </p>

        <button className="mais">
         <X size={17} />
        </button>
       </div>

       <div className="taskBody">
        <div className="alta">
         <span>Prioridade: Alta</span>
        </div>
       </div>


       <div className="taskFooter">
        <Bookmark />
        <div className="container-perfil">
         <img src={user.ImageProfile} />
        </div>
       </div>

      </div>


     </div>
     {/* Col-2 */}


   
    </div>
   </div>
  </>
 )
}
export default QuadroLaudo;