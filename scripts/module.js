

class Ruling {

    static TEMPLATES = {
        RULING: "/modules/ruling/templates/ruling-chat.hbs"
      }
    
    _valor=null;
    _dice=null;


}

//CONFIG.debug.hooks = true;


Hooks.once('init', () => {

    console.log("Ruling | Modulo de Ruling Inicializado com sucesso! ")

});

Hooks.once('ready', () => {
    
});



Hooks.on("renderSceneControls", (controls, html) => { 
    
    // find the element which has our logged in user's id

  if(game.user.isGM){
  
    
    const olscene = html.find(`[class="main-controls app control-tools "]`)
  
   
  
    // insert a button at the end of this element


    olscene.append(
      `<li class="scene-control active ruling-icon-button"  title="Ruling">
      <i class="fas fa-dice-six"></i></li>`
    );

    html.on('click', '.ruling-icon-button', (event) => {
        
        //pega os tojens selecionados
        let uuids = canvas.tokens.controlled.map((token) => token.actor.uuid);
        
        //Cria um dialogo peindo que o mestre defina o ruling
        (async () => {
          const myContent = await renderTemplate(Ruling.TEMPLATES.RULING);

          new Dialog({
            title: "Ruling",
            content: myContent,
            buttons: {
              button1: {
                label: "Ok",
                callback: (html) => rulind(html),
                icon: `<i class="fas fa-check"></i>`
              },
              button2: {
                label: "Cancel",
                callback: () => {ui.notifications.info(game.i18n.localize("MODULE.Cancel"))},
                icon: `<i class="fas fa-times"></i>`
              }
            }
          }).render(true);




        })();
        
        
        
        async function rulind(html) {

         
          
          let chatData = {
            user:game.user._id,
            visivel: uuids,
            whisper: []
          };

          
          
          let cardData = {
            owner: "MESTRE",
            valor:1,
            dice:"1d6"
          };

          let selecionados = [];

          uuids.forEach(e => {
            
            selecionados.push(game.actors.get(e.slice(6, e.length)));
            return selecionados;
                        
          });

                        
         
          for (let usuario of game.users){
            for (let ator of selecionados){
              if((ator.testUserPermission(usuario,CONST.ENTITY_PERMISSIONS.OWNER)) && (!usuario.isGM)){
                chatData.whisper.push(usuario);
                break;
              }
            }
          }

          cardData.valor = html.find("input#numero-alvo").val();
          Ruling._valor = cardData.valor
          cardData.dice = html.find("select#ruling-dice").val();
          Ruling._dice = cardData.dice

          chatData.content = await renderTemplate( `/modules/ruling/templates/ruling-msg.hbs`, cardData);
          
          //chatData.roll= "1d20";

          //chatData.roll= true;
          
          if (chatData.whisper.length != 0) {
            ChatMessage.create(chatData);
          }else{
            ui.notifications.info(game.i18n.localize("MODULE.TokenWoPlayer"))
          } 

         }


    });
  }
  

});


Hooks.on( "renderChatMessage" ,(app, html, data)=>{
  

  html.on('click', '.ruling-msg', (event) => {
    
    (async () => {

      let resultCardData = {
        valor:Ruling._valor,
        dice:Ruling._dice
      };

      let resultChatData = {
        user:game.user._id
      };

      let r = new Roll(resultCardData.dice);
      // Execute the roll
      r.evaluate({ async: true });

      // The resulting equation after it was rolled
      resultCardData.resultado = r.result; 

      resultChatData.content = await renderTemplate(`/modules/ruling/templates/ruling-result.hbs`,resultCardData);

      r.toMessage(resultChatData);

    })();

  });

});
