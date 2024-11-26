document.getElementById('generateEpub').addEventListener('click', () => {
    const form = document.getElementById('epubForm');
    const formData = new FormData(form);

    // Create JSZip instance
    const zip = new JSZip();

    // Add the mimetype file as the first file, uncompressed
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // Generate a unique identifier
    const uniqueId = 'urn:uuid:' + crypto.randomUUID();
    const isoDate = new Date().toISOString().split('.')[0] + 'Z';

    // Add the container.xml file
    const containerXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n' +
        '    <rootfiles>\n' +
        '        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n' +
        '    </rootfiles>\n' +
        '</container>\n';
    zip.file('META-INF/container.xml', containerXml);

    // Add the toc.xhtml file (required for the `nav` element)
    const tocXhtml = '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<html xmlns="http://www.w3.org/1999/xhtml">\n' +
        '    <head>\n' +
        '        <title>Table of Contents</title>\n' +
        '    </head>\n' +
        '    <body>\n' +
        '        <nav epub:type="toc">\n' +
        '            <h1>Table of Contents</h1>\n' +
        '            <ol>\n' +
        '                <li><a href="chapter1.xhtml">' + formData.get('chapterTitle1') + '</a></li>\n' +
        '            </ol>\n' +
        '        </nav>\n' +
        '    </body>\n' +
        '</html>\n';
    zip.file('OEBPS/toc.xhtml', tocXhtml); // Ensure this file is added

    // Add the toc.ncx file with the correct identifier
    const tocNcx = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">\n' +
        '<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n' +
        '    <head>\n' +
        '        <meta name="dtb:uid" content="' + uniqueId + '"/>\n' +
        '        <meta name="dtb:depth" content="1"/>\n' +
        '        <meta name="dtb:totalPageCount" content="0"/>\n' +
        '        <meta name="dtb:maxPageNumber" content="0"/>\n' +
        '    </head>\n' +
        '    <docTitle>\n' +
        '        <text>' + formData.get('title') + '</text>\n' +
        '    </docTitle>\n' +
        '    <navMap>\n' +
        '        <navPoint id="navPoint-1" playOrder="1">\n' +
        '            <navLabel><text>' + formData.get('title') + '</text></navLabel>\n' +
        '            <content src="chapter1.xhtml"/>\n' +
        '        </navPoint>\n' +
        '    </navMap>\n' +
        '</ncx>\n';
    zip.file('OEBPS/toc.ncx', tocNcx);

    // Add the content.opf file
    const contentOpf = '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">\n' +
        '    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n' +
        '        <dc:title>' + formData.get('title') + '</dc:title>\n' +
        '        <dc:creator>' + formData.get('author') + '</dc:creator>\n' +
        '        <dc:description>' + formData.get('description') + '</dc:description>\n' +
        '        <dc:language>' + formData.get('language') + '</dc:language>\n' +
        '        <dc:identifier id="BookId">' + uniqueId + '</dc:identifier>\n' +
        '        <meta property="dcterms:modified">' + isoDate + '</meta>\n' +
        '    </metadata>\n' +
        '    <manifest>\n' +
        '        <item id="toc" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n' +
        '        <item id="nav" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>\n' +
        '        <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>\n' +
        '    </manifest>\n' +
        '    <spine toc="toc">\n' +
        '        <itemref idref="nav"/>\n' +
        '        <itemref idref="chapter1"/>\n' +
        '    </spine>\n' +
        '</package>\n';
    zip.file('OEBPS/content.opf', contentOpf);

    // Add a sample chapter
    const chapter1Xhtml = '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<html xmlns="http://www.w3.org/1999/xhtml">\n' +
        '    <head>\n' +
        '        <title>' + formData.get('chapterTitle1') + '</title>\n' +
        '    </head>\n' +
        '    <body>\n' +
        '        <h1>' + formData.get('chapterTitle1') + '</h1>\n' +
        '        <p>' + formData.get('chapterContent1') + '</p>\n' +
        '    </body>\n' +
        '</html>\n';
    zip.file('OEBPS/chapter1.xhtml', chapter1Xhtml);

    // Generate the ePub file
    zip.generateAsync({ type: 'blob' }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'book.epub';
        link.click();
    }).catch(err => {
        console.error("Error generating ePub:", err);
    });
});
