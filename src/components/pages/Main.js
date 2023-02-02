import './Main.css';
import { useEffect, useState } from 'react';
import axios from 'axios';



function Main() {


    let api_url = "https://esilv.olfsoftware.fr/td5/";

    let [id, setId] = useState();
    let [sequence, setSequence] = useState(0);
    let [oldList, setOldList] = useState([]);
    let [myList, setStoredData] = useState([]);




    useEffect(() => {
      const newList = localStorage.getItem('sequence')
      if (newList) {
        const sequence = JSON.parse(newList)
        setSequence(sequence)
      }
    }, [])

    useEffect(() => {
      const myId = localStorage.getItem('id')
      if (myId) {
        const theId = JSON.parse(myId)
        setId(theId)
      }
    }, [])

    useEffect(() => {
      const newList = localStorage.getItem('myList')
      if (newList) {
        const myList = JSON.parse(newList)
        setStoredData(myList)
      }
    }, [])

    useEffect(() => {
      const previousList = localStorage.getItem('oldList')
      if (previousList) {
        const list = JSON.parse(previousList)
        setOldList(list)
      }
    }, [])


      async function register () 
      {
        const response = await fetch(api_url + "register");
        const data = await response.json();
        localStorage.setItem('myList', JSON.stringify(data.courses));
        localStorage.setItem('oldList', JSON.stringify(data.courses))
        setId(data.id);
        setSequence(data.sequence);
        setStoredData(data.courses);
        console.log("ID : " + data.id);
        console.log("Sequence : " + data.sequence);
        localStorage.setItem('id', JSON.stringify(data.id));
        localStorage.setItem('sequence', JSON.stringify( data.sequence));
        console.log("myList : " + data);


      }

      async function letsSynchronize() 
      {
        let changes = {"chg":[],"sequence":(parseInt(sequence) + 1).toString()};

        for (let i in myList) {
          if (!oldList[i]) 
          {
              let newQty = "+" + myList[i].qte.toString();
              changes.chg.push({"produit":myList[i].produit,"qte":newQty});
          } 
          else if (parseInt(myList[i].qte) !== parseInt(oldList[i].qte)) 
          {
              let diff = parseInt(myList[i].qte) - parseInt(oldList[i].qte);
              if (diff > 0)
              {
                diff = "+" + diff.toString();
              }
              let modProduct = myList[i].produit.toString();
              changes.chg.push({"produit":modProduct,"qte":diff.toString()});
          }
      }

        changes = JSON.stringify(changes);
  

        console.log("Changes : " + changes);

      
        const response = await fetch(api_url + "courses?id=" + id + "&seq=" + sequence.toString());
        const data = await response.json();
        setSequence(data.sequence);
        localStorage.setItem('sequence', JSON.stringify( data.sequence));

        fetch('https://esilv.olfsoftware.fr/td5/courses', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: id,
            chg: JSON.parse(changes)
          })
        }).then((response) => {
          if (response.ok) {
            response.json().then((json) => {
              console.log(json);
            });
          }
        }).catch(e=>console.log(e));

        }


      function gSubmit(event) {
        event.preventDefault();
        let modify = 0;
        for (const i in myList)  {
          if (myList[i].produit === event.target.Nom.value) {
            if (event.target.Quantite.value === "")
            {
              myList[i].qte = 0;
            }
            else {
            myList[i].qte = event.target.Quantite.value;
            }
            modify = 1;
          }
        }
        if (modify === 0) {
          if (event.target.Quantite.value === "")
          {
            event.target.Quantite.value = 0;
          }
          setStoredData([...myList, { produit: event.target.Nom.value, qte: event.target.Quantite.value }]);
        }
        else  
        {
          setStoredData([...myList]);
        }
          localStorage.setItem('myList', JSON.stringify(myList));

      }

      function gDelete(event) {
        event.preventDefault();
        setStoredData([]);
        console.log(myList);
      }

      function selectProduct(product) {
        // Put the product in the input
        document.getElementById("Nom").value = product.produit;
        document.getElementById("Quantite").value = product.qte;
      }






    return (

      <div class="MainContainer">
        <div class="Header">
         <button onClick={register}>Register</button>


        <p class= "Title">Créer ou Modifier une liste de course : </p>
        </div>
        <div class="Corpus">
            Your id: {id}, Last sequence synchronized: {sequence}
        </div>


  

        <div class="input-container">

        <form onSubmit={gSubmit}>
              <label class="input-label">Produit</label>
              <input type="text" id="Nom" class="input-field"/>

              <label class="input-label">Quantite</label>
              <input type="number" id="Quantite" class="input-field" placeholder='0'/>

            <button class="add-button" type="submit">Ajouter</button> <button onClick={gDelete}>Supprimer</button>
        </form>
        <div> <button onClick={letsSynchronize} > Envoyer Liste (Futur Synchronize) </button></div>

        </div>

        <div>
 
          <div>
            
          </div>
        </div>
        <div> <p class="Title">Votre liste de course :</p></div>
        <div class="list-container">
          {
            myList.map((item, index) => 
            (<button onClick={() => selectProduct(item)} class="list-item" key={index}>
            {item.produit.toLowerCase()} : {item.qte}</button>)
            )
          }
        </div>


        <div>
          {
          oldList.length !== 0 && ( 
          <div>
            <div class="Title">
              Ancienne Liste de course
            </div>
            <div class="list-container"> 
              {
                oldList.map((item, index) => (
                <a class="list-item" key={index}>
                  {item.produit} : {item.qte}
                </a>))
              }
</div></div>)}
        </div>

            

      </div>
    );
  }

export default Main;