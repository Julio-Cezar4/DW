const cadastros = [{nome: "admin", email: "admin@sistema.com", senha: "admin"}];

/* Função que Verifica se existe o email informado no banco de dados */
function verifica_existencia(email) {

    return new Promise((resolve) => {
        fetch('http://localhost:3000/users').then((response) => {
            response.json().then((users) => {
                for (i in users) {
                    if (users[i].email == email) {
                        resolve(true);
                        return;
                    }
                }
                resolve(false);
                return;
            })
        })
    })

}
function entrar() {
    let id = '';
    let email = document.querySelector('input#mail').value;
    let senha = document.querySelector("input#password").value;
    let verifica = false;

    if (email.length > 0 && senha.length > 0) {
        fetch('http://localhost:3000/users').then((response) => {
            response.json().then((users) => {
                for (i in users) {
                    if (users[i].email == email && users[i].senha == senha) {
                        id = users[i].id;
                        verifica = true;
                        // Armazenar o nome do usuário no localStorage
                        localStorage.setItem('userName', users[i].nome);
                        window.location.href = "../User-page/page_user.html"; // Corrigir o redirecionamento para a página correta
                        break;
                    }
                }
                if (verifica == false) {
                    window.alert('Usuário ou senha inválidos!');
                    return;
                }
                user_info(id);
            });
        });
    } else {
        alert('Preencha todos os campos!');
        return;
    }
}

function user_info(id){
    fetch(`http://localhost:3000/users/${id}`)
    .then((response) => {return response.json()})
    .then((response) => {
        for (let i=0; i <= response.history.length; i++){
            console.log(response.history[i]);
        }
        console.log(response.nome)

    })
}

function cadastrar(){
    let nome = document.querySelector('input#nome').value;
    let email = document.querySelector('input#mail').value;
    let senha = document.querySelector("input#password").value;
    let confirm_senha = document.querySelector("input#conf-password").value;
    const new_user = {
        nome: nome,
        email: email,
        senha: senha,
        history: []
    }
    const url = "http://localhost:3000/users"

    // Configuração das opções para a requisição POST
    const options = {
        // Método da requisição (neste caso, POST)
            method: 'POST',
        // Cabeçalhos da requisição, incluindo o tipo de conteúdo esperado (application/json)
            headers: {
                'Content-Type': 'application/json'
            },
        // Corpo da requisição, contendo os dados do novo usuário convertidos para JSON
            body: JSON.stringify(new_user)
        }
        
        /* verifica se todos os campos do cadastro foi preenchido*/
        if (nome.length == 0 || email.length == 0 || senha.length == 0 ||confirm_senha.length == 0) {
            alert('Preencha todos os campos!')
            return;
        }
        if (senha.value != confirm_senha.value){
            alert('Senhas não conferem!')
            return;
        }
    verifica_existencia(email).then((emailExiste) => {
        if (emailExiste == true) {
            alert(`Email Já Está Cadastrado!`);
            return;
        } else {
            // Se o email não existe, realiza o cadastro
            fetch(url, options)
                .then((response) => {
                    if (!response.ok) {
                        /* isso interrompe a execução normal do código e causa a saída imediata da função atual. */
                        throw new Error('Erro ao enviar os dados para o servidor');
                    }
                    return response.json(); /* Converte em json a resposta */
                })
                .then((data) => {
                    console.log('Novo usuário cadastrado com sucesso:', data);
                    window.location.href = '../login/login.html'                    
                })
                .catch((error) => {
                    console.error("Erro: ", error);
                });
        }
    }).catch((error) => {
        console.error("Erro ao verificar existência de email:", error);
    });

}

function buscarFabricante(macAddress) {
    fetch('../data/dispositivos.json')
        .then(response => response.json())
        .then(dispositivos => {
            const dispositivo = dispositivos.find(d => d.mac.toLowerCase() === macAddress.toLowerCase());
            const resultadoDiv = document.getElementById('resultado');
            if (dispositivo) {
                resultadoDiv.textContent = `${dispositivo.fabricante}`;
            } else {
                resultadoDiv.textContent = 'Fabricante não encontrado.';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar fabricante:', error);
        });
}


function add() {
    const macAddress = document.getElementById('pesquisado').value.toUpperCase();
    
    buscarFabricante(macAddress)
        .then(fabricante => {
            if (fabricante) {
                const userName = localStorage.getItem('userName');
                
                if (userName) {
                    fetch('http://localhost:3000/users')
                        .then(response => response.json())
                        .then(users => {
                            const user = users.find(u => u.nome === userName);
                            if (user) {
                                // Atualiza o histórico do usuário
                                const historicoItem = `${macAddress}-${fabricante}`;
                                user.history.push(historicoItem);
                                
                                fetch(`http://localhost:3000/users/${user.id}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(user)
                                }).then(() => {
                                    // Exibe o fabricante encontrado
                                    document.getElementById('resultado').textContent = `Fabricante: ${fabricante}`;
                                });
                            }
                        });
                } else {
                    console.error('Nome de usuário não encontrado.');
                }
            } else {
                document.getElementById('resultado').textContent = 'Fabricante não encontrado.';
            }
        });
}

function buscarFabricante(mac) {
    return fetch('../data/dispositivos.json')
        .then(response => response.json())
        .then(dispositivos => {
            const dispositivo = dispositivos.find(d => d.mac === mac);
            return dispositivo ? dispositivo.fabricante : null;
        });
}
