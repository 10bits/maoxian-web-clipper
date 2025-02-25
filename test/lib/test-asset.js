
import H from '../helper.js';
import Asset from '../../src/js/lib/asset.js';

describe("Asset", () => {

  const template = '$DOMAIN_$TITLE_$TIME-INTSEC-$MD5URL$EXT';
  const valueObj = {
    now: Date.now(),
    domain: 'a.org',
    title: 'awesomeTitle',
  }

  it("getNameByLink: link only", () => {
    const link = 'https://a.org/foo.jpg';
    const name = Asset.getNameByLink({template, valueObj, link});
    H.assertMatch(name, /^a.org_awesomeTitle_[^\.\/]+\.jpg$/);
  });

  it("getNameByLink: with extension", () => {
    const link = 'https://a.org/foo.jpg';
    const name = Asset.getNameByLink({
      template: template,
      valueObj: valueObj,
      link: link,
      extension: 'txt',
    });
    H.assertMatch(name, /^a.org_awesomeTitle_[^\.\/]+\.txt$/);
  });

  it("getNameByLink: link doesn't has an extension", () => {
    const link = 'https://a.org/foo';
    const name = Asset.getNameByLink({template, valueObj, link});
    H.assertMatch(name, /^a.org_awesomeTitle_[^\.\/]+$/);
  })


  it("getNameByLink: with httpMimeType", () => {
    const link = 'https://a.org/foo.bmp';
    const name = Asset.getNameByLink({
      template: template,
      valueObj: valueObj,
      link: link,
      mimeTypeData: {
        httpMimeType: 'image/jpeg',
        attrMimeType: 'image/png'
      },
    });
    H.assertMatch(name, /^a.org_awesomeTitle_[^\.\/]+\.bmp$/);
  });

  it("getNameByLink: with attrMimeType", () => {
    const link = 'https://a.org/foo.bmp';
    const name = Asset.getNameByLink({
      template: template,
      valueObj: valueObj,
      link: link,
      mimeTypeData: {
        attrMimeType: 'image/png'
      },
    });
    H.assertMatch(name, /^a.org_awesomeTitle_[^\.\/]+\.bmp$/);
  });

  it("getNameByLink: invalid image file extension", () => {
    const link = 'https://a.org/foo.image?id=xxx';
    const name = Asset.getNameByLink({
      template: template,
      valueObj: valueObj,
      link: link,
      mimeTypeData: {
        attrMimeType: 'image/png'
      },
      resourceType: 'image'
    });
    H.assertMatch(name, /^a.org_awesomeTitle_[^\.\/]+\.png$/);
  });

  it("getNameByLink: data link", () => {
    const link = 'data:image/png;base64,imagedata';
    const nameA = Asset.getNameByLink({
      template: template,
      valueObj: valueObj,
      link: link,
      mimeTypeData: {
        httpMimeType: 'image/jpeg'
      }
    });
    H.assertMatch(nameA, /^a.org_awesomeTitle_[^\.\/]+\.png$/);

    const nameB = Asset.getNameByLink({
      template: template,
      valueObj: valueObj,
      link: link,
      extension: 'ico'
    });
    H.assertMatch(nameB, /^a.org_awesomeTitle_[^\.\/]+\.png$/);
  });

});

