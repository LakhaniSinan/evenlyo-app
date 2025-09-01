import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import BillingTable from '../../../components/billingTable';
import AnalyticsReport from '../../../components/modals/AnalyticsReport';
import InvoiceModal from '../../../components/modals/InvoiceModal';

const BillingManagement = () => {
  const dummyData = [
    {
      billingId: 'INV-001',
      date: '6/15/2024',
      plan: 'Basic',
      amount: 0,
      status: 'Paid',
    },
    {
      billingId: 'INV-002',
      date: '6/18/2024',
      plan: 'Premium',
      amount: 20,
      status: 'Left',
    },
  ];

  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);

  const handleFilter = () => {
    console.log('Filter by date clicked');
    setModalVisible(true);
  };

  const handleExport = () => {
    console.log('Export PDF clicked');
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <AppHeader
        headingText={'Booking Details'}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.chatIcon}
        onLeftIconPress={() => {
          navigation.goBack();
        }}
        onRightIconPress={() => {
          navigation.navigate('Notification');
        }}
      />
      <BillingTable
        data={dummyData}
        onFilterPress={handleFilter}
        onExportPress={handleExport}
        handlPayAmount={() => setModalVisible(true)}
        handleDownload={() => setInvoiceModal(true)}
      />
      <AnalyticsReport
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <InvoiceModal
        visible={invoiceModal}
        onClose={() => setInvoiceModal(false)}
      />
    </SafeAreaView>
  );
};

export default BillingManagement;
