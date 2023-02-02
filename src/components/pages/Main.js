import './Main.css';
import { useEffect, useState } from 'react';



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
        for (let i in data.courses) {
          data.courses[i].produit = data.courses[i].produit.toString().toLowerCase();
        }
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
        let products = [];
        let oldProducts = [];


        for (let i in myList) {
          products.push(myList[i].produit);
        }

        for (let i in oldList) {
          oldProducts.push(oldList[i].produit);
        }

     
          for (let p in products) {
            let inside = oldProducts.indexOf(products[p]);
            let indexInOldList = oldProducts.indexOf(products[p]);
            let indexInMyList = products.indexOf(products[p]);
            if (inside === -1) {
              let newQty = "+" + myList[indexInMyList].qte.toString();
              changes.chg.push({"produit":myList[p].produit,"qte":newQty});
            }
            else if (parseInt(myList[indexInMyList].qte) !== parseInt(oldList[indexInOldList].qte)) {
              let diff = parseInt(myList[indexInMyList].qte) - parseInt(oldList[indexInOldList].qte);
              if (diff > 0) {
                diff = "+" + diff.toString();
              }
              let modProduct = myList[indexInMyList].produit.toString();
              changes.chg.push({"produit":modProduct,"qte":diff.toString()});
            }
          }
          for (let x in oldProducts) {
            let inside = products.indexOf(oldProducts[x]);
            if (inside === -1 && oldList[x].qte !== "0") {
              let newQty = "-" + oldList[x].qte.toString();
              changes.chg.push({"produit":oldList[x].produit,"qte":newQty});
            }
          }
            // if the product is not in the old list, it means it's a new product
            
          // if the product is not in the old list, it means it's a new product
          
      
        changes = JSON.stringify(changes);
  

        console.log("Changes : " + changes);

      
        const response = await fetch(api_url + "courses?id=" + id + "&seq=" + sequence.toString());
        const data = await response.json();
        setSequence(data.sequence);
        localStorage.setItem('sequence', JSON.stringify( data.sequence));

        fetch('https://esilv.olfsoftware.fr/td5/courses',{
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: 'id=' + id + '&chg=' + changes
        }).then((reponse) => {
              // console.log(reponse);
              if (reponse.ok) {
                  reponse.json().then((json) => {
                      console.log(json);
            })
              }
          });
      }

    function gSubmit(nomValue, quantiteValue) {
      let alreadyIn = 0;
    
      for (const i in myList)  
      {
        if (myList[i].produit.toString().toLowerCase() === nomValue.toString().toLowerCase()) 
        {
          myList[i].qte = quantiteValue;
          if (quantiteValue === "0" || quantiteValue === "")
          {
            myList.splice(i, 1);
          }
          alreadyIn = 1;
        }
      }
     
      setStoredData([...myList]);
    
      if (alreadyIn === 0)
      {
        if (quantiteValue === "" || quantiteValue === "0")
        {
          window.alert("Quantité nulle, le produit n'a pas été ajouté");
        }
        else
        {
          myList.push({produit: nomValue.toString().toLowerCase(), qte: quantiteValue});
          setStoredData([...myList]);
        }
      }
      localStorage.setItem('myList', JSON.stringify(myList));
    }
    



      function gDeleteAll() {
        setStoredData([]);
        console.log(myList);
      }

      function selectProduct(product) {
        // Put the product in the input
        document.getElementById("Nom").value = product.produit;
        document.getElementById("Quantite").value = product.qte;
      }

      function gDelete(product) {
        let allProducts = [];
        for (let i in myList) {
          allProducts.push(myList[i].produit);
        }
        let index = allProducts.indexOf(product);
        console.log("Index : " + index)
        myList.splice(index, 1);
        setStoredData([...myList]);
        localStorage.setItem('myList', JSON.stringify(myList));
      }




//           



    return (

      <div className="MainContainer">
        <div className="Header">
        <p className= "Title">Créer ou Modifier une liste de course : </p>
        </div>
        <div className="Corpus">
          <div> 
            <span className="Title" id="connexion"> Première connexion : </span>
            <button onClick={register} id="register">Register</button>


          </div>
            Your id: {id}, Last sequence synchronized: {sequence}
        </div>


  

        <div className="input-container">

        <form>
          <label className="input-label">Produit</label>
          <input type="text" id="Nom" className="input-field" onKeyDown={(a) => {if (a.key === "Enter") {gSubmit(document.getElementById("Nom").value, document.getElementById("Quantite").value)}}} />
          <label className="input-label">Quantite</label>
          <input type="number" id="Quantite" className="input-field" placeholder='0' onKeyDown={(a) => { if (a.key === "Enter") {gSubmit(document.getElementById("Nom").value, document.getElementById("Quantite").value)}}} />
          
          <button className="add-button" type="submit" id="add" onClick={() => gSubmit(document.getElementById("Nom").value, document.getElementById("Quantite").value)}>Ajouter / Modifier</button> 
          <button className="delete-button" type="submit" id="delete" onClick={() => gDelete(document.getElementById("Nom").value)}>Supprimer</button>
        </form>

          
          <div>
            <button onClick={() => { if (window.confirm("Are you sure you want to delete the list?")) {gDeleteAll();}}} >Supprimer la liste</button>
          </div>


        </div>
        <div> 
          <button onClick={letsSynchronize} > Synchronize </button>
        </div>


        <div> 
          <p className="Title">Votre liste de course :</p>
        </div>
        <div className="list-container">
          {
            myList.map((item, index) => 
            (<button onClick={() => selectProduct(item)} className="list-item" key={index}>
            {item.produit} : {item.qte}</button>)
            )
          }
        </div>


 
          <div>
            <div className="Title">
              Ancienne Liste de course récupérée
            </div>
            <div className="list-container"> 
              {
                oldList.map((item, index) => (
                <span className="list-item" key={index}>
                  {item.produit} : {item.qte}
                </span>))
              }
            </div>
          </div>

            

      </div>
    );
  }

export default Main;