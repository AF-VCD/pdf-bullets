import pikepdf
class XfaObj(dict):
    def __init__(self, sourcePdf):
        self.source = sourcePdf
        self.root = self.source.Root.AcroForm.XFA
        self.xfaDict = {}
        
        for i,item in enumerate(self.root):
            if(i % 2 == 0 and isinstance(item,pikepdf.String)):
                #print(f'label {i}: {item}')
                label = f'{item}'
                self.xfaDict[label] = self.root[i+1]
        #this next line is way more important/useful than it appears!
        # it makes someone able to treat an XfaObj as a dict pretty much.
        super(XfaObj,self).__init__(self.xfaDict)
         

    def __getitem__(self,key):
        if(isinstance(self.xfaDict[key],pikepdf.Stream)):
            return self.xfaDict[key].read_bytes().decode('utf-8')
        else:
            print('xfa item detected was not a stream')
            return self.xfaDict[key]

    #note: pikepdf.Stream requires straight up bytes. 
    def __setitem__(self,key,value):
        if(isinstance(value,str)):
            value = bytes(value,'utf-8')
        self.xfaDict[key].write(value)