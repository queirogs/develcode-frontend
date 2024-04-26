import React, { useEffect } from 'react';
import Header from './components/Header';
import { useState } from 'react';

import deleteIcon from './public/delete.svg'
import editIcon from './public/edit.png'
import noImageIcon from './public/image.png'
import trashIcon from './public/trash.svg'

export interface propsInterface{
    id: number,
    image: string,
    username: string,
    birthday: number,
}


const App: React.FC = () => {
    const [users, setUsers] = useState<propsInterface[]>([])
    const [photo, setPhoto] = useState<File | null | any>(null)
    const [editMode, setEditMode] = useState<number>(-1)
    
    const url = "http://localhost:8080/user"

    async function fetchUsers(){
        const response:Response = await fetch(url);
        
        if(!response.ok) throw new Error("Erro na solicitação: "  + response.status)

        const data = await response.json();
        setUsers(data)
    }

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];
            setPhoto(selectedFile);
        }
    };

    const deleteUser = async (id: number) => {
        const options = {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
        }
        
        const response = await fetch(url+"/"+id, options)
        if(!response.ok) throw new Error("Erro ao deletar usuário")
        fetchUsers()
    };
      
    const createUser = async (event:any) =>{
        event.preventDefault();

        const date = new Date(event.target.birthday.value);
        const timestamp = date.getTime();

        if (event.target.username.value && event.target.birthday.value && event.target.photo.value && photo != null){ 
            var newUser:propsInterface = {
                id: 0,
                image: photo ? URL.createObjectURL(photo) : '',
                username: event.target.username.value,
                birthday: timestamp
            }

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            }

            const response = await fetch(url, options)

            if(!response.ok) throw new Error("Erro ao enviar os dados para o banco")
        } else {
            alert('Preencha todos os campos antes de salvar o usuário!');
        }
        setPhoto(null)
        event.target.reset();
        fetchUsers();
    }

    const updateUser = async (event:any) =>{
        event.preventDefault();

        const date = new Date(event.target.editBirthday.value);
        const timestamp = date.getTime();

        if (event.target.editUsername.value && event.target.editBirthday.value && event.target.photo.value){ 
            var newUser:propsInterface = {
                id: 0,
                image: event.target.photo.value,
                username: event.target.editUsername.value,
                birthday: timestamp
            }

            const options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            }

            const response = await fetch(url + "/" + editMode, options)

            if(!response.ok) throw new Error("Erro ao enviar os dados para o banco")
        } else {
            alert('Preencha todos os campos antes de salvar o usuário!');
        }
        event.target.reset();
        setEditMode(-1)
        fetchUsers();
    }

    const timeToDate = (timestamp: number) => {
        timestamp += 86400000
        let data = new Date(timestamp)
        let final = data.toDateString()
        return(final)
    }

    useEffect(() =>{
        fetchUsers()
    },[])

    return (
    <div className='flex flex-col bg-[#343434] min-h-screen h-full break-all'>
        <Header />
        
        <form onSubmit={createUser} className='border-[1px] border-[#3b3b3b] relative mt-[24px] sm:mt-[40px] sm:w-[516px] sm:mx-0 w-[90%] h-fit p-[24px] rounded-[3px] flex flex-col gap-[8px] self-center bg-[#313131] mb-[81px]'>
        <div className='flex justify-center'>
                {
                    photo ? <img className="z-0 absolute top-[24px] w-[88px] aspect-square rounded-[36px] self-center" src={URL.createObjectURL(photo)} alt="" />  : <img className="absolute top-[24px] w-[88px] aspect-square self-center" src={noImageIcon} alt="" />
                }
                <img className={`${photo ? '' : 'hidden'} w-[24px] aspect-square absolute top-[56px] right-[174px] hover:cursor-pointer`} src={trashIcon} alt="Remove icon" onClick={()=>{setPhoto(null)}}/>
            </div>
            <label id="label" htmlFor="photo" className={`hover:cursor-pointer z-10 w-[88px] aspect-square rounded-[36px] self-center mb-[8px]`}></label>
            <input id="photo" className="hidden" type="file" accept='image/*' onChange={handlePhotoChange}/>
            
            <label htmlFor="author" className='text-[#ffffff]'>Nome do usuário</label>
            <input id="username" placeholder="Nome" className="w-full h-[40px] p-[12px] text-[#ffffff] font-[14px] bg-[#494949] rounded-[8px]" type="text" maxLength={30}/>
            
            <label htmlFor="birthday" className='text-[#ffffff] mt-4'>Data de nascimento</label>
            <input id="birthday" type="date" className='w-full p-[12px] min-w-[40px] resize-none text-[#9CA3AF] font-[14px] bg-[#494949] rounded-[8px]'/>

            <div className='flex justify-end gap-[24px] mt-[32px]'>
                <input className='bg-none text-[#5f5f5f] font-[14px] underline self-center hover:cursor-pointer' type="reset" value="Descartar" />
                <button className='bg-[#71bb00] text-white font-[14px] rounded-[8px] px-[24px] py-[12px]' type="submit">Cadastrar usuário</button>
            </div>
        </form>
        
        
        {
            users.map((user, index)=>(
                <>
                    {
                        editMode !== user.id ? (
                            <>
                                <div key={index} className={`bg-[#313131] sm:w-[516px] w-[90%] relative h-fit self-center pl-[24px] pr-[12px] pt-[12px] pb-[32px] flex flex-col mb-[16px] border-[1px] border-[#3b3b3b]`}>
                                    <p className={`${(index == 0) ? '' : 'hidden'} absolute top-[-30px] left-0 text-[#7a7a7a] font-[14px]`}>Usuários cadastrados</p>
                                    <div className='self-end flex'>
                                        <img className={`mr-2 w-[30px] aspect-square hover:cursor-pointer ${editMode === user.id ? 'hidden' : ''}`} src={editIcon} alt="Edit user button" onClick={() => setEditMode(user.id)}/>
                                        <img className={`w-[30px] aspect-square hover:cursor-pointer ${editMode === user.id ? 'hidden' : ''}`} src={deleteIcon} alt="Delete user button" onClick={() => deleteUser(user.id)}/>
                                    </div>

                                    <div className='flex gap-[32px] mt-[24px] pr-[48px]'>
                                        <img className="sm:w-[88px] sm:h-[88px] w-[60px] h-[60px] rounded-[36px]" src={user.image} alt="" />
                                        <div className='flex flex-col gap-[1.25vw]'>
                                            <span className='text-[#9f9f9f] mb-[24px] text-2xl'>{user.username}</span>
                                            <div className='flex flex-col'>
                                                <span className='text-[#5f5f5f] font-[0.625vw] mb-[0.104vw]'>Data de nascimento</span>
                                                <span className='text-[#7a7a7a] font-[0.729vw]'>{timeToDate(user.birthday)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (   
                            <>
                                <form onSubmit={updateUser} key={index} className={`bg-[#313131] sm:w-[516px] w-[90%] relative h-fit self-center pl-[24px] pr-[12px] pt-[12px] pb-[32px] flex flex-col mb-[16px] border-[1px] border-[#3b3b3b]`}>
                                    <p className={`${(index == 0) ? '' : 'hidden'} absolute top-[-30px] left-0 text-[#7a7a7a] font-[14px]`}>Usuários cadastrados</p>
                                    <div className='self-end flex'>
                                        <button className='bg-[#71bb00] text-white font-[14px] rounded-[8px] px-[12px] py-[6px]' type="submit">Salvar</button>
                                    </div>

                                    <div className='flex gap-[32px] mt-[24px] pr-[48px]'>
                                        <img className="sm:w-[88px] sm:h-[88px] w-[60px] h-[60px] rounded-[36px]" src={user.image} alt=""/>
                                        <input id="photo" className="hidden" type="text" value={user.image}/>
                                        <div className='flex flex-col gap-[1.25vw]'>
                                            <div className='flex flex-col'>
                                                <label className="text-[#5f5f5f] font-[0.625vw] mb-[0.104vw]" htmlFor="editUsername">Nome do usuário</label>
                                                <input id="editUsername" className='w-[350px] h-[40px] p-[12px] text-[#ffffff] font-[14px] bg-[#494949] rounded-[8px]' placeholder={user.username} />
                                            </div>

                                            <div className='flex flex-col'>
                                                <label htmlFor='editDate' className='text-[#5f5f5f] font-[0.625vw] mb-[0.104vw]'>Data de nascimento</label>
                                                <input id="editBirthday" type="date" className='w-full h-[40px] p-[12px] text-[#ffffff] font-[14px] bg-[#494949] rounded-[8px]' />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </>
                        )
                    }
                </>
            ))
        }

    </div>
    );
}

export default App;
