print("Content-Type: text/plain;charset=utf-8")
print()

import ssl
import cgi

import os, sys
sys.path.append('.')


import pikepdf
from xfaTools import XfaObj
from bs4 import BeautifulSoup
import io
import re
import json
#import cgitb
#cgitb.enable()



#print("Succesfully posted to python script")


form = cgi.FieldStorage()
pdfName = form["pdf"].filename
if pdfName:
    #print(f'Pdf Name: {pdfName}')
    #print(form["pdf"].value)
    b = io.BytesIO(form["pdf"].value)
    
    with pikepdf.Pdf.open(b,suppress_warnings=False) as pdfobj:
        jsonDict = {}
        xfaobj = XfaObj(pdfobj)
        hotfix = re.sub('&#xD;','\n',xfaobj["datasets"])
        formSoup = BeautifulSoup(hotfix,'xml')
        targetTag = formSoup.find('specificAccomplishments')
        bullets = targetTag.string
        if(bullets):
            #print(f"found bullets: \n{bullets}")
            jsonDict["bullets"] = bullets
        else:
            print(f"did not find any bullets")

        templateSoup = BeautifulSoup(xfaobj['template'],'html.parser')
        bulletAttr = templateSoup.find('field',attrs={'name':'specificAccomplishments'})
        jsonDict["width"] = bulletAttr['w']
        jsonDict["font"] = bulletAttr.font['typeface']
        jsonDict["fontSize"] = bulletAttr.font['size']
    
        print(json.dumps(jsonDict))

else:
    print('no pdf file supplied')