using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class ClickUrl : MonoBehaviour
{
    public string url;
    public void open()
    {
        StartCoroutine(GetRequest(url));
    }
 
    IEnumerator GetRequest(string uri)
    {
        using (UnityWebRequest webRequest = UnityWebRequest.Get(uri))
        {
            
            yield return webRequest.SendWebRequest();
 
        }
    }
}
